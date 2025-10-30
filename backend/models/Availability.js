const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true, index: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    note: { type: String, default: '' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);
