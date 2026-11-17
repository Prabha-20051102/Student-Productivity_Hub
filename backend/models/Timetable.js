const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    day: {
      type: String,
      required: [true, 'Day of week is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'] // Format: '09:00'
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'] // Format: '10:00'
    },
    room: {
      type: String,
      default: '',
      trim: true
    },
    instructor: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Timetable', timetableSchema);
