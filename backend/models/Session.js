const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    fromUserId: { type: Number, required: true, index: true },
    toUserId: { type: Number, required: true, index: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    note: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Session || mongoose.model('Session', SessionSchema);
