require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { router: authRouter } = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const campaignsRouter = require('./routes/campaigns');
const employeesRouter = require('./routes/employees');
const simulationsRouter = require('./routes/simulations');
const trainingRouter = require('./routes/training');
const eventsRouter = require('./routes/events');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

// Request logger for live debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/simulations', simulationsRouter);
app.use('/api/training', trainingRouter);
app.use('/api/events', eventsRouter);
app.use('/api/reports', reportsRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'CyberShield Adaptive Human Risk Platform',
    version: '2.4.0-enterprise',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if present
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// Catch-all route for SPA navigation (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  CYBERSHIELD ENTERPRISE SOC BACKEND ONLINE`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🔒 SQLite Database Engine: Node 24 native node:sqlite`);
  console.log(`======================================================\n`);
});
