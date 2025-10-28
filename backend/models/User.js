const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, default: '' },
    courses: { type: [String], default: [] },
    schedule: { type: String, default: '' },
    studyStyle: {
      type: String,
      enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reader'],
      required: true,
    },
    bio: { type: String, default: '' },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);


