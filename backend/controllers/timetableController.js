const Timetable = require('../models/Timetable');

const dayOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7
};

// @desc    Get all timetable entries for student
// @route   GET /api/timetable
// @access  Private
exports.getTimetable = async (req, res) => {
  try {
    const entries = await Timetable.find({ user: req.user._id });

    // Sort by day order, then startTime
    entries.sort((a, b) => {
      const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });

    res.status(200).json({
      success: true,
      count: entries.length,
      timetable: entries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch timetable', error: error.message });
  }
};

// @desc    Add new slot to timetable
// @route   POST /api/timetable
// @access  Private
exports.createTimetableEntry = async (req, res) => {
  try {
    const { subject, day, startTime, endTime, room, instructor } = req.body;

    if (!subject || !day || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide subject, day, start time, and end time' });
    }

    const entry = await Timetable.create({
      user: req.user._id,
      subject,
      day,
      startTime,
      endTime,
      room: room || '',
      instructor: instructor || ''
    });

    res.status(201).json({
      success: true,
      message: 'Timetable entry added successfully!',
      entry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create timetable slot', error: error.message });
  }
};

// @desc    Update a timetable slot
// @route   PUT /api/timetable/:id
// @access  Private
exports.updateTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findOne({ _id: req.params.id, user: req.user._id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    const { subject, day, startTime, endTime, room, instructor } = req.body;

    if (subject) entry.subject = subject;
    if (day) entry.day = day;
    if (startTime) entry.startTime = startTime;
    if (endTime) entry.endTime = endTime;
    if (room !== undefined) entry.room = room;
    if (instructor !== undefined) entry.instructor = instructor;

    await entry.save();

    res.status(200).json({
      success: true,
      message: 'Timetable slot updated successfully!',
      entry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update timetable slot', error: error.message });
  }
};

// @desc    Delete a timetable slot
// @route   DELETE /api/timetable/:id
// @access  Private
exports.deleteTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete entry', error: error.message });
  }
};
