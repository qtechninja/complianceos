const express = require('express');
const router = express.Router();

router.get('/me', (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = db.prepare('SELECT u.*, t.name as tenantName FROM users u JOIN tenants t ON u.tenantId = t.id WHERE u.id = 1').get();
    res.json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.prepare('SELECT * FROM users WHERE tenantId = 1 ORDER BY name').all();
    res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

module.exports = router;
