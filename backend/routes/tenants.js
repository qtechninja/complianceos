const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const tenants = db.prepare('SELECT * FROM tenants ORDER BY name').all();
    res.json({ data: tenants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load tenants' });
  }
});

router.post('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, industry, country, employeeCount } = req.body;
    if (!name || !industry || !country) {
      return res.status(400).json({ error: 'name, industry, and country are required' });
    }
    const result = db.prepare('INSERT INTO tenants (name,industry,country,employeeCount,readinessScore) VALUES (?,?,?,?,0)').run(name, industry, country, employeeCount || 0);
    res.status(201).json({ data: db.prepare('SELECT * FROM tenants WHERE id = ?').get(result.lastInsertRowid) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

router.get('/stats', (req, res) => {
  try {
    const db = req.app.locals.db;
    const tenants = db.prepare('SELECT t.*, (SELECT COUNT(*) FROM ai_systems WHERE tenantId = t.id) as systemCount, (SELECT COUNT(*) FROM users WHERE tenantId = t.id) as userCount FROM tenants t ORDER BY t.name').all();
    res.json({ data: tenants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load tenant stats' });
  }
});

module.exports = router;
