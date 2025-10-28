const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();

// Accept same-origin and common localhost dev ports
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: false }));
app.use(express.json());

// Health for function root
app.get('/health', (_req, res) => res.json({ ok: true }));

// Mount routes under /api to keep frontend URLs unchanged
app.use('/api', apiRoutes);

// Lazy Mongo connect on first request if not connected
const MONGO_URI = process.env.MONGO_URI;
let mongoConnecting = null;

async function ensureMongo() {
  if (!MONGO_URI) return; // allow in-memory fallback in serverless too
  if (mongoose.connection.readyState === 1) return;
  if (mongoConnecting) return mongoConnecting;
  mongoConnecting = mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 }).catch(() => undefined);
  return mongoConnecting;
}

app.use(async (_req, _res, next) => {
  try {
    await ensureMongo();
  } catch (_) {
    // ignore, fallback to memory in routes
  }
  next();
});

module.exports = app;


