const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { systemId, status } = req.query;
    let sql = `SELECT r.*, u.name as ownerName, a.name as systemName FROM requirements r
      LEFT JOIN users u ON r.ownerUserId = u.id
      JOIN ai_systems a ON r.aiSystemId = a.id
      WHERE r.tenantId = 1`;
    const params = [];
    if (systemId) { sql += ' AND r.aiSystemId = ?'; params.push(systemId); }
    if (status) { sql += ' AND r.status = ?'; params.push(status); }
    sql += ' ORDER BY r.article, r.createdAt';
    const reqs = db.prepare(sql).all(...params);
    res.json({ data: reqs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load requirements' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const req_ = db.prepare(`SELECT r.*, u.name as ownerName, a.name as systemName FROM requirements r
      LEFT JOIN users u ON r.ownerUserId = u.id JOIN ai_systems a ON r.aiSystemId = a.id WHERE r.id = ?`).get(req.params.id);
    if (!req_) return res.status(404).json({ error: 'Requirement not found' });
    const gaps = db.prepare('SELECT * FROM gaps WHERE requirementId = ? ORDER BY CASE priority WHEN \'Critical\' THEN 1 WHEN \'High\' THEN 2 WHEN \'Medium\' THEN 3 ELSE 4 END').all(req.params.id);
    res.json({ data: { ...req_, gaps } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load requirement' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status, ownerUserId, dueDate } = req.body;
    const existing = db.prepare('SELECT id FROM requirements WHERE id = ? AND tenantId = 1').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Requirement not found' });
    db.prepare('UPDATE requirements SET status=?, ownerUserId=?, dueDate=? WHERE id=?').run(status, ownerUserId || null, dueDate || null, req.params.id);
    res.json({ data: db.prepare('SELECT * FROM requirements WHERE id = ?').get(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

module.exports = router;
