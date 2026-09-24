const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const systems = db.prepare(`
      SELECT s.*, u.name as ownerName FROM ai_systems s
      LEFT JOIN users u ON s.ownerUserId = u.id
      WHERE s.tenantId = 1 ORDER BY s.createdAt DESC
    `).all();
    res.json({ data: systems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load AI systems' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const system = db.prepare(`
      SELECT s.*, u.name as ownerName FROM ai_systems s
      LEFT JOIN users u ON s.ownerUserId = u.id
      WHERE s.id = ? AND s.tenantId = 1
    `).get(req.params.id);
    if (!system) return res.status(404).json({ error: 'System not found' });

    const assessment = db.prepare('SELECT * FROM assessments WHERE aiSystemId = ? ORDER BY createdAt DESC LIMIT 1').get(req.params.id);
    const requirements = db.prepare(`
      SELECT r.*, u.name as ownerName FROM requirements r
      LEFT JOIN users u ON r.ownerUserId = u.id
      WHERE r.aiSystemId = ? ORDER BY r.article
    `).all(req.params.id);
    const gapCount = db.prepare("SELECT COUNT(*) as c FROM gaps g JOIN requirements r ON g.requirementId = r.id WHERE r.aiSystemId = ? AND g.status = 'Open'").get(req.params.id).c;

    res.json({ data: { ...system, assessment, requirements, openGaps: gapCount } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load AI system' });
  }
});

router.post('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, provider, purpose, dataSensitivity, customerFacing, department, useCase, ownerUserId } = req.body;
    if (!name || !provider || !purpose || !dataSensitivity) {
      return res.status(400).json({ error: 'name, provider, purpose, and dataSensitivity are required' });
    }
    const result = db.prepare(`
      INSERT INTO ai_systems (tenantId,name,provider,purpose,ownerUserId,dataSensitivity,customerFacing,approvalStatus,euAiActStatus,department,useCase)
      VALUES (1,?,?,?,?,?,?,?,?,?,?)
    `).run(name, provider, purpose, ownerUserId || null, dataSensitivity, customerFacing ? 1 : 0, 'Pending', 'Not Assessed', department || null, useCase || null);
    const created = db.prepare('SELECT * FROM ai_systems WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ data: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create AI system' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, provider, purpose, dataSensitivity, customerFacing, approvalStatus, euAiActStatus, department, useCase, ownerUserId } = req.body;
    const existing = db.prepare('SELECT id FROM ai_systems WHERE id = ? AND tenantId = 1').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'System not found' });

    db.prepare(`UPDATE ai_systems SET name=?, provider=?, purpose=?, dataSensitivity=?, customerFacing=?, approvalStatus=?, euAiActStatus=?, department=?, useCase=?, ownerUserId=? WHERE id=?`).run(
      name, provider, purpose, dataSensitivity, customerFacing ? 1 : 0, approvalStatus, euAiActStatus, department || null, useCase || null, ownerUserId || null, req.params.id
    );
    const updated = db.prepare('SELECT * FROM ai_systems WHERE id = ?').get(req.params.id);
    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update AI system' });
  }
});

// Assessment endpoints
router.get('/:id/assessment', (req, res) => {
  try {
    const db = req.app.locals.db;
    const assessment = db.prepare('SELECT * FROM assessments WHERE aiSystemId = ? ORDER BY createdAt DESC LIMIT 1').get(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'No assessment found' });
    assessment.questionnaireData = JSON.parse(assessment.questionnaireData || '{}');
    res.json({ data: assessment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load assessment' });
  }
});

router.post('/:id/assessment', (req, res) => {
  try {
    const db = req.app.locals.db;
    const system = db.prepare('SELECT * FROM ai_systems WHERE id = ? AND tenantId = 1').get(req.params.id);
    if (!system) return res.status(404).json({ error: 'System not found' });

    const { questionnaireData } = req.body;
    if (!questionnaireData) return res.status(400).json({ error: 'questionnaireData is required' });

    // Determine risk level from questionnaire
    const q = questionnaireData;
    let riskLevel = 'Minimal';
    let applicabilityResult = '';
    let pathway = '';

    if (q.lawEnforcement) {
      riskLevel = 'Unacceptable';
      applicabilityResult = 'Prohibited — Article 5';
      pathway = 'This AI system falls under prohibited uses under Article 5 of the EU AI Act. Real-time biometric identification in public spaces for law enforcement is prohibited except in very narrow circumstances requiring judicial authorisation.';
    } else if (q.biometricData && q.customerFacing) {
      riskLevel = 'High';
      applicabilityResult = 'High Risk — Annex III Category 1';
      pathway = 'Biometric identification or categorisation systems that interact with individuals are classified as High Risk under Annex III.';
    } else if (q.creditScoring || (q.purpose && q.purpose.toLowerCase().includes('credit'))) {
      riskLevel = 'High';
      applicabilityResult = 'High Risk — Annex III Category 5(b)';
      pathway = 'AI systems used to evaluate creditworthiness or establish credit scores for natural persons are High Risk under Annex III Category 5(b).';
    } else if (q.recruitment) {
      riskLevel = 'High';
      applicabilityResult = 'High Risk — Annex III Category 1(a)';
      pathway = 'AI used in recruitment, CV screening, or candidate ranking is classified as High Risk under Annex III Category 1(a).';
    } else if (q.vulnerable) {
      riskLevel = 'High';
      applicabilityResult = 'High Risk — affects vulnerable populations';
      pathway = 'Systems that may impact vulnerable groups require elevated compliance obligations under the EU AI Act.';
    } else if (q.customerFacing && q.dataTypes && q.dataTypes.length > 2) {
      riskLevel = 'Limited';
      applicabilityResult = 'Limited Risk — Transparency obligations apply';
      pathway = 'Customer-facing AI with significant data processing must disclose to users that they are interacting with an AI system (Art. 50).';
    } else {
      riskLevel = 'Minimal';
      applicabilityResult = 'Minimal Risk — No mandatory obligations';
      pathway = 'This AI system does not fall under any high-risk categories in Annex III. Voluntary codes of conduct are recommended.';
    }

    const existing = db.prepare('SELECT id FROM assessments WHERE aiSystemId = ?').get(req.params.id);
    let assessment;
    if (existing) {
      db.prepare('UPDATE assessments SET questionnaireData=?, applicabilityResult=?, pathway=?, riskLevel=?, status=? WHERE aiSystemId=?').run(
        JSON.stringify(questionnaireData), applicabilityResult, pathway, riskLevel, 'Complete', req.params.id
      );
      assessment = db.prepare('SELECT * FROM assessments WHERE aiSystemId = ?').get(req.params.id);
    } else {
      const r = db.prepare(`INSERT INTO assessments (aiSystemId,tenantId,questionnaireData,applicabilityResult,pathway,riskLevel,status) VALUES (?,1,?,?,?,?,?)`).run(
        req.params.id, JSON.stringify(questionnaireData), applicabilityResult, pathway, riskLevel, 'Complete'
      );
      assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(r.lastInsertRowid);
    }

    // Update system status
    const euStatus = riskLevel === 'Minimal' ? 'Compliant' : 'In Progress';
    db.prepare('UPDATE ai_systems SET euAiActStatus = ? WHERE id = ?').run(euStatus, req.params.id);

    assessment.questionnaireData = JSON.parse(assessment.questionnaireData);
    res.json({ data: assessment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

module.exports = router;
