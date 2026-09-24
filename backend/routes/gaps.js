const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { priority, status, systemId } = req.query;
    let sql = `SELECT g.*, r.article, r.title as reqTitle, a.name as systemName, a.id as aiSystemId
      FROM gaps g JOIN requirements r ON g.requirementId = r.id
      JOIN ai_systems a ON r.aiSystemId = a.id WHERE g.tenantId = 1`;
    const params = [];
    if (priority) { sql += ' AND g.priority = ?'; params.push(priority); }
    if (status) { sql += ' AND g.status = ?'; params.push(status); }
    if (systemId) { sql += ' AND r.aiSystemId = ?'; params.push(systemId); }
    sql += ' ORDER BY CASE g.priority WHEN \'Critical\' THEN 1 WHEN \'High\' THEN 2 WHEN \'Medium\' THEN 3 ELSE 4 END, g.createdAt DESC';
    res.json({ data: db.prepare(sql).all(...params) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load gaps' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const existing = db.prepare('SELECT id FROM gaps WHERE id = ? AND tenantId = 1').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Gap not found' });
    db.prepare('UPDATE gaps SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ data: db.prepare('SELECT * FROM gaps WHERE id = ?').get(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update gap' });
  }
});

module.exports = router;
