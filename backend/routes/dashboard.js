const express = require('express');
const router = express.Router();

router.get('/summary', (req, res) => {
  try {
    const db = req.app.locals.db;
    const tenantId = 1;

    const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
    const totalSystems = db.prepare('SELECT COUNT(*) as c FROM ai_systems WHERE tenantId = ?').get(tenantId).c;
    const openGaps = db.prepare("SELECT COUNT(*) as c FROM gaps WHERE tenantId = ? AND status IN ('Open','In Progress')").get(tenantId).c;
    const criticalGaps = db.prepare("SELECT COUNT(*) as c FROM gaps WHERE tenantId = ? AND status = 'Open' AND priority = 'Critical'").get(tenantId).c;
    const pendingApprovals = db.prepare("SELECT COUNT(*) as c FROM ai_systems WHERE tenantId = ? AND approvalStatus = 'Pending'").get(tenantId).c;
    const openIncidents = db.prepare("SELECT COUNT(*) as c FROM incidents WHERE tenantId = ? AND status != 'Resolved'").get(tenantId).c;
    const nonCompliant = db.prepare("SELECT COUNT(*) as c FROM ai_systems WHERE tenantId = ? AND euAiActStatus = 'Non-Compliant'").get(tenantId).c;
    const inProgress = db.prepare("SELECT COUNT(*) as c FROM requirements WHERE tenantId = ? AND status = 'In Progress'").get(tenantId).c;

    const recentIncidents = db.prepare("SELECT i.*, a.name as systemName FROM incidents i LEFT JOIN ai_systems a ON i.aiSystemId = a.id WHERE i.tenantId = ? ORDER BY i.createdAt DESC LIMIT 5").all(tenantId);
    const recentGaps = db.prepare(`SELECT g.*, r.article, r.title as reqTitle, a.name as systemName
      FROM gaps g JOIN requirements r ON g.requirementId = r.id
      JOIN ai_systems a ON r.aiSystemId = a.id
      WHERE g.tenantId = ? AND g.status = 'Open' ORDER BY
        CASE g.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, g.createdAt DESC LIMIT 5`).all(tenantId);

    res.json({
      data: {
        tenant,
        stats: { totalSystems, openGaps, criticalGaps, pendingApprovals, openIncidents, nonCompliant, inProgress, readinessScore: tenant.readinessScore },
        recentIncidents,
        recentGaps,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;
