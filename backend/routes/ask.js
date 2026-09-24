const express = require('express');
const router = express.Router();

const KNOWLEDGE_BASE = {
  'chatgpt': {
    canUpload: 'anonymised or pseudonymised data only',
    cannotUpload: 'full PII, account numbers, transaction records, data under bank secrecy',
    policy: 'ChatGPT Enterprise Data Processing Agreement',
    risk: 'Medium',
  },
  'loansense': {
    riskLevel: 'High',
    articles: ['Art. 9 Risk Management','Art. 10 Data Governance','Art. 14 Human Oversight'],
    status: 'In Progress — 3 open critical gaps',
  },
  'fraudguard': {
    riskLevel: 'High',
    articles: ['Art. 9','Art. 10','Art. 14'],
    status: 'Non-Compliant — 4 open gaps',
  },
};

function generateAnswer(question, systemName, role) {
  const q = question.toLowerCase();

  if (q.includes('upload') && q.includes('customer')) {
    return {
      answer: `Based on your organisation's AI policy and GDPR requirements:\n\n✅ **Allowed:**\n- Anonymised or pseudonymised customer data\n- Aggregated statistics without individual identifiers\n- Internal documents not containing personal data\n\n❌ **Not Allowed:**\n- Full customer PII (name + account number + address)\n- Transaction histories directly attributable to individuals\n- Data under bank secrecy or NDA obligations\n\n**Recommended action:** Use the approved data anonymisation tool before uploading. If unsure, contact the Compliance Manager before proceeding.`,
      sources: ['GDPR Art. 25 (Data minimisation)','Meridian AI Acceptable Use Policy v2.1','ChatGPT Enterprise Data Processing Agreement'],
    };
  }

  if (q.includes('high risk') || q.includes('eu ai act')) {
    return {
      answer: `Under the EU AI Act, **High Risk AI systems** (Annex III) must comply with:\n\n1. **Art. 9** — Risk Management System throughout the lifecycle\n2. **Art. 10** — Data governance: bias testing, quality criteria for training data\n3. **Art. 11** — Technical documentation (Annex IV format)\n4. **Art. 12** — Automatic logging for traceability\n5. **Art. 13** — Transparency to deployers\n6. **Art. 14** — Human oversight mechanisms\n7. **Art. 15** — Accuracy, robustness, and cybersecurity\n8. **Art. 16** — EU database registration + CE marking\n\nYour organisation currently has **2 High Risk systems**: LoanSense AI and FraudGuard ML. LoanSense AI is In Progress; FraudGuard ML is Non-Compliant with 4 open gaps.`,
      sources: ['EU AI Act Art. 6(2)','Annex III','Arts. 9–16 Compliance Checklist'],
    };
  }

  if (q.includes('deploy') || q.includes('deployment') || q.includes('before')) {
    return {
      answer: `Before deploying an AI system at your organisation, you must:\n\n1. **Register** the system in the AI Inventory ✅\n2. **Complete** the EU AI Act Assessment to determine risk level\n3. If **High Risk**: complete all Annex IV documentation, bias audit, and human oversight design\n4. **Obtain approval** from your Compliance Manager\n5. **Data Protection Impact Assessment** (DPIA) if processing personal data at scale\n6. **Training** for all staff who will use or oversee the system\n7. **Incident response plan** documented and tested\n\nFor systems classified as Prohibited under Art. 5, deployment is not permitted under any circumstances.`,
      sources: ['EU AI Act Art. 16 (Provider obligations)','Art. 29 (Deployer obligations)','GDPR Art. 35 (DPIA)'],
    };
  }

  if (q.includes('bias') || q.includes('fairness')) {
    return {
      answer: `**Bias and Fairness Requirements under the EU AI Act:**\n\nFor High Risk systems (Art. 10), training data must:\n- Be free of errors and complete\n- Have appropriate statistical properties across demographic groups\n- Be tested for bias related to protected characteristics: age, gender, ethnicity, disability\n\n**Recommended tools:** IBM AI Fairness 360, Google What-If Tool, or Aequitas\n\n**Current status:** LoanSense AI has a **Critical gap** — training data has not undergone bias testing for protected characteristics. A bias complaint was filed on 2024-10-15 and is under investigation.\n\n**Action required:** Commission independent bias audit within 30 days.`,
      sources: ['EU AI Act Art. 10(2)','Art. 10(5) — Bias and fairness','GDPR Art. 22 — Automated decision-making'],
    };
  }

  if (q.includes('penalty') || q.includes('fine') || q.includes('sanction')) {
    return {
      answer: `**EU AI Act Penalties:**\n\n| Violation | Maximum Fine |\n|-----------|-------------|\n| Prohibited AI (Art. 5) | €35M or 7% global annual turnover |\n| High Risk non-compliance | €15M or 3% global annual turnover |\n| Providing incorrect information to authorities | €7.5M or 1.5% global annual turnover |\n\nFines apply to the higher of the fixed amount or the percentage. For SMEs and start-ups, national authorities must take proportionality into account.\n\n⚠️ **Your organisation has 2 non-compliant or in-progress High Risk systems.** Prioritise gap remediation to avoid regulatory exposure.`,
      sources: ['EU AI Act Art. 99','Art. 101 (Penalties for SMEs)','Recital 161'],
    };
  }

  if (q.includes('copilot') || q.includes('github')) {
    return {
      answer: `**GitHub Copilot at ${systemName || 'your organisation'}:**\n\nCopilot is classified as **Minimal Risk** under the EU AI Act (not in Annex III). Current status: **Compliant**.\n\n✅ Safe to use for:\n- Code completion and suggestions\n- Test generation\n- Documentation drafts\n\n⚠️ Be careful with:\n- Code that processes personal data — review AI suggestions carefully\n- Proprietary algorithms — Copilot trained on public code; check for licence issues\n- Security-sensitive code — always have a human review before merging\n\nNo mandatory EU AI Act obligations apply, but the voluntary Code of Practice for GPAI models is recommended.`,
      sources: ['EU AI Act Annex III (exclusions)','GitHub Copilot Terms of Service','Meridian Secure Coding Policy v1.3'],
    };
  }

  // Default contextual answer
  const systemContext = systemName
    ? `Regarding **${systemName}**: this system is registered in your AI inventory. `
    : '';

  return {
    answer: `${systemContext}I can help you with:\n\n- **Data upload policies** — what customer data can be used with which AI tools\n- **EU AI Act requirements** — risk classification, compliance obligations, deadlines\n- **Deployment checklists** — what you need before going live\n- **Bias and fairness** — testing requirements and tools\n- **Penalties and enforcement** — what's at stake for non-compliance\n- **Specific AI systems** — ask about ChatGPT, LoanSense AI, FraudGuard ML, HireIQ, or Copilot\n\nTry asking: "Can I upload customer data to ChatGPT?" or "What do we need for LoanSense AI compliance?"`,
    sources: ['EU AI Act (2024/1689)','Meridian AI Policy v2.1','ComplianceOS Knowledge Base'],
  };
}

router.post('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { question, aiSystemId, role } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    let systemName = null;
    if (aiSystemId) {
      const sys = db.prepare('SELECT name FROM ai_systems WHERE id = ?').get(aiSystemId);
      if (sys) systemName = sys.name;
    }

    const { answer, sources } = generateAnswer(question, systemName, role);

    const result = db.prepare(`INSERT INTO ask_sessions (userId,tenantId,aiSystemId,question,answer,sources) VALUES (?,1,?,?,?,?)`).run(
      1, aiSystemId || null, question.trim(), answer, JSON.stringify(sources)
    );

    res.json({
      data: {
        id: result.lastInsertRowid,
        question: question.trim(),
        answer,
        sources,
        createdAt: new Date().toISOString(),
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

router.get('/history', (req, res) => {
  try {
    const db = req.app.locals.db;
    const sessions = db.prepare(`SELECT s.*, a.name as systemName FROM ask_sessions s
      LEFT JOIN ai_systems a ON s.aiSystemId = a.id
      WHERE s.tenantId = 1 ORDER BY s.createdAt DESC LIMIT 20`).all();
    const parsed = sessions.map(s => ({ ...s, sources: JSON.parse(s.sources || '[]') }));
    res.json({ data: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

module.exports = router;
