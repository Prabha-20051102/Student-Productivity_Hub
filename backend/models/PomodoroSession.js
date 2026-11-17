const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 25
    },
    sessionType: {
      type: String,
      enum: ['study', 'short_break', 'long_break'],
      default: 'study'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema);
