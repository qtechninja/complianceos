require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
// CORS: allow configured frontend, Render domains, and localhost for dev
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin.endsWith('.onrender.com') || origin.includes('localhost')) return cb(null, true);
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return cb(null, true);
    cb(null, true); // permissive for MVP demos
  },
}));
app.use(morgan('dev'));
app.use(express.json());

// Database setup
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
app.locals.db = db;

// Initialize schema and seed
const { createSchema } = require('./models/schema');
const { seedDatabase } = require('./models/seed');
createSchema(db);
seedDatabase(db);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ai-systems', require('./routes/aiSystems'));
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/gaps', require('./routes/gaps'));
app.use('/api/ask', require('./routes/ask'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/users', require('./routes/users'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
