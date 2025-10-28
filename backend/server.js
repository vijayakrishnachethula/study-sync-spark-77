const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studysync';
const PORT = process.env.PORT || 5000;

const app = express();

// CORS for local frontend (Vite 5173) and React 3000
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: false }));

// Body parser
app.use(express.json());

// Simple health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Root info route
app.get('/', (_req, res) => {
  res.type('text/plain').send('StudySync API is running. Try /health or /api/users');
});

// Mount routes
app.use('/api', apiRoutes);

// Connect DB and start server
async function start() {
  try {
    // Attempt mongoose connection
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 1500,
    });
    // eslint-disable-next-line no-console
    console.log('[backend] Connected to MongoDB');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[backend] MongoDB not available, continuing with in-memory store');
  }

  // Skip TS-based startup seeding; GET /api/users will seed when empty

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] Server listening on http://localhost:${PORT}`);
  });
}

start();

module.exports = app;


