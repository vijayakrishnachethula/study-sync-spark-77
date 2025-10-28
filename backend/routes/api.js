const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { computeMatch } = require('../utils/matcher');
const seed = require('./seed');

// In-memory fallback store
const memory = {
  users: [],
  nextId: 1,
};

function isMongoConnected() {
  const state = mongoose.connection.readyState;
  return state === 1; // connected
}

function ensureMemorySeeded() {
  if (memory.users.length > 0) return;
  // minimal hardcoded seed to ensure API works without Mongo and without seed file
  memory.users = [
    { id: 1, name: 'Alex Chen', courses: ['CS101', 'CS220'], schedule: 'Mon 9:00, Wed 14:00', studyStyle: 'Visual' },
    { id: 2, name: 'Jordan Smith', courses: ['CS220', 'CS310'], schedule: 'Tue 15:00, Thu 15:00', studyStyle: 'Auditory' },
    { id: 3, name: 'Sam Martinez', courses: ['CS101', 'CS310'], schedule: 'Mon 10:00, Thu 14:00', studyStyle: 'Kinesthetic' },
    { id: 4, name: 'Taylor Johnson', courses: ['MATH215', 'CS415'], schedule: 'Fri 15:00', studyStyle: 'Reader' },
    { id: 5, name: 'Morgan Lee', courses: ['CS101', 'ENG201'], schedule: 'Sat 10:00', studyStyle: 'Visual' },
  ];
  memory.nextId = 6;
}

// POST /api/users - Save a user profile
router.post('/users', async (req, res) => {
  // eslint-disable-next-line no-console
  console.log('[POST] /api/users', req.body);
  try {
    const body = req.body || {};
    // ensure numeric id
    let id = Number(body.id);
    if (!Number.isFinite(id)) {
      id = isMongoConnected() ? Date.now() : memory.nextId++;
    }

    const doc = {
      id,
      name: body.name || '',
      courses: Array.isArray(body.courses) ? body.courses : [],
      schedule: String(body.schedule || ''),
      studyStyle: body.studyStyle,
      bio: body.bio || '',
    };

    if (isMongoConnected()) {
      await User.findOneAndUpdate({ id }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
    } else {
      ensureMemorySeeded();
      const existingIdx = memory.users.findIndex((u) => u.id === id);
      if (existingIdx >= 0) memory.users[existingIdx] = doc; else memory.users.push(doc);
    }

    return res.json({ success: true, id });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/users - All users
router.get('/users', async (_req, res) => {
  // eslint-disable-next-line no-console
  console.log('[GET] /api/users');
  try {
    if (isMongoConnected()) {
      let users = await User.find({}).lean();
      if (users.length === 0) {
        // Seed mocks into Mongo when empty
        const mocks = [
          { id: 1, courses: ['CS101'], schedule: 'Mon 9-11', studyStyle: 'Visual' },
          { id: 2, courses: ['CS101', 'WebDev301'], schedule: 'Tue 1-3', studyStyle: 'Auditory' },
          { id: 3, courses: ['Math202'], schedule: 'Wed 2-4', studyStyle: 'Kinesthetic' },
          { id: 4, courses: ['CS101', 'Econ201'], schedule: 'Mon 10-12', studyStyle: 'Visual' },
          { id: 5, courses: ['Bio101'], schedule: 'Thu 3-5', studyStyle: 'Reader' },
        ];
        await User.insertMany(mocks);
        users = await User.find({}).lean();
      }
      return res.json(users);
    }
    ensureMemorySeeded();
    return res.json(memory.users);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /api/matches?myId=123
router.get('/matches', async (req, res) => {
  // eslint-disable-next-line no-console
  console.log('[GET] /api/matches', req.query);
  try {
    const myId = Number(req.query.myId);
    if (!Number.isFinite(myId)) {
      return res.status(400).json({ error: 'myId is required as a number' });
    }

    let users;
    if (isMongoConnected()) {
      users = await User.find({}).lean();
    } else {
      ensureMemorySeeded();
      users = memory.users;
    }

    const me = users.find((u) => u.id === myId);
    if (!me) {
      return res.status(404).json({ error: 'User not found' });
    }

    const candidates = users.filter((u) => u.id !== myId);
    const scored = candidates.map((c) => ({ profile: c, score: computeMatch(me, c) }))
      .sort((a, b) => b.score.score - a.score.score)
      .slice(0, 5);

    return res.json(scored);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Helper to push seeds into memory when not using Mongo
router.post('/seed', async (_req, res) => {
  try {
    const seeded = await seed.seedFromFrontendMocks(memory, isMongoConnected() ? User : null);
    return res.json({ ok: true, seeded });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;


