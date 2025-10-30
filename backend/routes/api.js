const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Session = require('../models/Session');
const { computeMatch } = require('../utils/matcher');
const seed = require('./seed');
const { sendEmail } = require('../utils/email');

// In-memory fallback store
const memory = {
  users: [],
  nextId: 1,
  availability: [], // { id, userId, start, end, note }
  sessions: [], // { id, fromUserId, toUserId, start, end, note, status }
  nextAvailId: 1,
  nextSessionId: 1,
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
      phone: body.phone || '',
      email: body.email || '',
      instagram: body.instagram || '',
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

// -----------------------------
// Availability Endpoints
// -----------------------------

// POST /api/availability  { userId, start, end, note }
router.post('/availability', async (req, res) => {
  try {
    const { userId, start, end, note } = req.body || {};
    const uid = Number(userId);
    if (!Number.isFinite(uid)) return res.status(400).json({ error: 'userId required as number' });
    const startDt = new Date(start);
    const endDt = new Date(end);
    if (!(startDt instanceof Date) || isNaN(startDt.getTime()) || !(endDt instanceof Date) || isNaN(endDt.getTime()) || endDt <= startDt) {
      return res.status(400).json({ error: 'invalid start/end' });
    }

    if (isMongoConnected()) {
      const doc = await Availability.create({ userId: uid, start: startDt, end: endDt, note: note || '', expiresAt: endDt });
      return res.json({ ok: true, id: String(doc._id) });
    }
    const id = memory.nextAvailId++;
    memory.availability.push({ id, userId: uid, start: startDt, end: endDt, note: note || '' });
    return res.json({ ok: true, id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /api/availability?userId=123
router.get('/availability', async (req, res) => {
  try {
    const uid = req.query.userId ? Number(req.query.userId) : null;
    if (isMongoConnected()) {
      const query = uid ? { userId: uid } : {};
      const rows = await Availability.find(query).lean();
      return res.json(rows);
    }
    const now = Date.now();
    const rows = memory.availability.filter(a => (!uid || a.userId === uid) && new Date(a.end).getTime() > now);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// -----------------------------
// Session Endpoints
// -----------------------------

// POST /api/sessions/propose { fromUserId, toUserId, start, end, note }
router.post('/sessions/propose', async (req, res) => {
  try {
    const { fromUserId, toUserId, start, end, note } = req.body || {};
    const f = Number(fromUserId), t = Number(toUserId);
    if (!Number.isFinite(f) || !Number.isFinite(t)) return res.status(400).json({ error: 'fromUserId and toUserId must be numbers' });
    const startDt = new Date(start); const endDt = new Date(end);
    if (!(startDt instanceof Date) || isNaN(startDt.getTime()) || !(endDt instanceof Date) || isNaN(endDt.getTime()) || endDt <= startDt) {
      return res.status(400).json({ error: 'invalid start/end' });
    }

    if (isMongoConnected()) {
      const doc = await Session.create({ fromUserId: f, toUserId: t, start: startDt, end: endDt, note: note || '', status: 'pending', expiresAt: startDt });
      return res.json({ ok: true, id: String(doc._id) });
    }
    const id = String(memory.nextSessionId++);
    memory.sessions.push({ id, fromUserId: f, toUserId: t, start: startDt, end: endDt, note: note || '', status: 'pending' });
    return res.json({ ok: true, id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /api/sessions/:id/accept
router.post('/sessions/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    let session;
    if (isMongoConnected()) {
      session = await Session.findById(id);
      if (!session) return res.status(404).json({ error: 'session not found' });
      session.status = 'accepted';
      await session.save();
      const a = await User.findOne({ id: session.fromUserId }).lean();
      const b = await User.findOne({ id: session.toUserId }).lean();
      if (a && b) {
        const text = `Your StudySync session is confirmed!\n\nWhen: ${session.start.toISOString()} - ${session.end.toISOString()}\n\nPartner A: ${a.name} (${a.email || 'no email'})\nPartner B: ${b.name} (${b.email || 'no email'})\n\nHappy studying!`;
        await sendEmail({ to: [a.email, b.email].filter(Boolean), subject: 'StudySync session confirmed', text });
      }
      return res.json({ ok: true });
    }
    session = memory.sessions.find(s => String(s.id) === String(id));
    if (!session) return res.status(404).json({ error: 'session not found' });
    session.status = 'accepted';
    // Try to lookup users in memory
    const a = memory.users.find(u => u.id === session.fromUserId) || {};
    const b = memory.users.find(u => u.id === session.toUserId) || {};
    const text = `Your StudySync session is confirmed!\n\nWhen: ${new Date(session.start).toISOString()} - ${new Date(session.end).toISOString()}\n\nPartner A: ${a.name || session.fromUserId} (${a.email || 'no email'})\nPartner B: ${b.name || session.toUserId} (${b.email || 'no email'})`;
    await sendEmail({ to: [a.email, b.email].filter(Boolean), subject: 'StudySync session confirmed', text });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /api/sessions/:id/decline
router.post('/sessions/:id/decline', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      const session = await Session.findById(id);
      if (!session) return res.status(404).json({ error: 'session not found' });
      session.status = 'declined';
      await session.save();
      return res.json({ ok: true });
    }
    const s = memory.sessions.find(x => String(x.id) === String(id));
    if (!s) return res.status(404).json({ error: 'session not found' });
    s.status = 'declined';
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});


