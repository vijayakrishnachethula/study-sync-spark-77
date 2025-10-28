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

// Mount routes at root; Vercel handler will strip leading /api
app.use('/', apiRoutes);

// Optional debug route to expose connection state. There are two safe modes:
// 1) Token-protected: set DEBUG_DB_TOKEN to a secret value and send that token
//    in the `x-debug-token` header for access. This is recommended for Preview.
// 2) Simple gate: set DEBUG_DB_ROUTE=true for quick debugging (not secure).
// Do NOT enable either in public production sites without restricting access.
app.get('/_debug/db', (req, res) => {
  const token = process.env.DEBUG_DB_TOKEN;
  const simpleGate = process.env.DEBUG_DB_ROUTE === 'true';

  if (token) {
    const provided = req.get('x-debug-token') || '';
    if (provided !== token) return res.status(401).json({ ok: false, error: 'unauthorized' });
  } else if (!simpleGate) {
    return res.status(404).json({ ok: false, error: 'not found' });
  }

  const state = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  return res.json({ debug: true, readyState: state, connected: state === 1, lastError: lastMongoError });
});

// Lazy Mongo connect on first request if not connected
const MONGO_URI = process.env.MONGO_URI;
let mongoConnecting = null;
let lastMongoError = null;

async function ensureMongo() {
  if (!MONGO_URI) {
    // Intentionally do not print the URI (secrets). Informational only.
    // Allow in-memory fallback in serverless too.
    console.log('[backend] MONGO_URI not set; using in-memory fallback');
    return;
  }

  if (mongoose.connection.readyState === 1) return;
  if (mongoConnecting) return mongoConnecting;

  console.log('[backend] Attempting MongoDB connection (serverless)');
  // Use a longer timeout for serverless cold starts and surface errors to logs.
  mongoConnecting = mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then(() => {
      console.log('[backend] Connected to MongoDB (serverless)');
      lastMongoError = null;
      return mongoose.connection;
    })
    .catch((err) => {
      // Reset so future requests can retry connection.
      mongoConnecting = null;
      // Log limited error info (do not log the URI)
      // eslint-disable-next-line no-console
      const msg = err && err.message ? err.message : String(err);
      console.error('[backend] MongoDB connection error:', msg);
      lastMongoError = msg;
      return undefined;
    });

  return mongoConnecting;
}

// Mongoose connection event logging to make failures visible in serverless logs.
mongoose.connection.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log('[backend][mongoose] connected');
});

mongoose.connection.on('disconnected', () => {
  // eslint-disable-next-line no-console
  console.log('[backend][mongoose] disconnected');
});

mongoose.connection.on('error', (err) => {
  // eslint-disable-next-line no-console
  const msg = err && err.message ? err.message : String(err);
  console.error('[backend][mongoose] error', msg);
  lastMongoError = msg;
});

app.use(async (_req, _res, next) => {
  try {
    await ensureMongo();
  } catch (_) {
    // ignore, fallback to memory in routes
  }
  next();
});

module.exports = app;


