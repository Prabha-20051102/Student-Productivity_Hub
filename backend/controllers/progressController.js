const StudyProgress = require('../models/StudyProgress');
const Task = require('../models/Task');
const Assignment = require('../models/Assignment');

// @desc    Get all study progress records
// @route   GET /api/progress
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    const records = await StudyProgress.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch progress logs', error: error.message });
  }
};

// @desc    Log a new study session
// @route   POST /api/progress
// @access  Private
exports.addProgress = async (req, res) => {
  try {
    const { subject, hoursSpent, date, notes } = req.body;

    if (!subject || hoursSpent === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide subject and hours spent' });
    }

    const record = await StudyProgress.create({
      user: req.user._id,
      subject,
      hoursSpent: Number(hoursSpent),
      date: date ? new Date(date) : new Date(),
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Study hours logged successfully!',
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to log study hours', error: error.message });
  }
};

// @desc    Delete a study log
// @route   DELETE /api/progress/:id
// @access  Private
exports.deleteProgress = async (req, res) => {
  try {
    const record = await StudyProgress.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Progress record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Study record deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete record', error: error.message });
  }
};

// @desc    Get aggregated study summary (weekly hours, subject breakdown, completed counts)
// @route   GET /api/progress/summary
// @access  Private
exports.getProgressSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Calculate date 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    // 2. Fetch study logs from the last 7 days
    const recentLogs = await StudyProgress.find({
      user: userId,
      date: { $gte: oneWeekAgo }
    });

    // Calculate total weekly hours
    const weeklyHours = recentLogs.reduce((sum, item) => sum + (item.hoursSpent || 0), 0);

    // Group hours by subject
    const subjectMap = {};
    recentLogs.forEach((item) => {
      subjectMap[item.subject] = (subjectMap[item.subject] || 0) + item.hoursSpent;
    });

    const subjectBreakdown = Object.keys(subjectMap).map((subject) => ({
      subject,
      hours: Number(subjectMap[subject].toFixed(1)),
      percentage: weeklyHours > 0 ? Math.round((subjectMap[subject] / weeklyHours) * 100) : 0
    }));

    // 3. Task completion stats
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, status: 'Completed' });
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 4. Assignment completion stats
    const totalAssignments = await Assignment.countDocuments({ user: userId });
    const completedAssignments = await Assignment.countDocuments({ user: userId, status: 'Completed' });
    const assignmentCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // Target weekly hours (e.g., standard 20 hours target for students)
    const weeklyTarget = 20;
    const weeklyProgressPercentage = Math.min(Math.round((weeklyHours / weeklyTarget) * 100), 100);

    res.status(200).json({
      success: true,
      summary: {
        weeklyHours: Number(weeklyHours.toFixed(1)),
        weeklyTarget,
        weeklyProgressPercentage,
        totalTasks,
        completedTasks,
        taskCompletionRate,
        totalAssignments,
        completedAssignments,
        assignmentCompletionRate,
        subjectBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compute progress summary', error: error.message });
  }
};
