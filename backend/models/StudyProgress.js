const mongoose = require('mongoose');

const studyProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: [true, 'Study date is required'],
      default: Date.now
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    hoursSpent: {
      type: Number,
      required: [true, 'Hours spent is required'],
      min: [0.1, 'Hours spent must be greater than 0'],
      max: [24, 'Hours spent cannot exceed 24 in a single day']
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StudyProgress', studyProgressSchema);
