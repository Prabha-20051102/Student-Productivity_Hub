const PomodoroSession = require('../models/PomodoroSession');

// @desc    Log a completed Pomodoro session
// @route   POST /api/pomodoro/session
// @access  Private
exports.logSession = async (req, res) => {
  try {
    const { durationMinutes, sessionType } = req.body;

    const session = await PomodoroSession.create({
      user: req.user._id,
      durationMinutes: durationMinutes || 25,
      sessionType: sessionType || 'study',
      completedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Pomodoro session recorded successfully!',
      session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record session', error: error.message });
  }
};

// @desc    Get Pomodoro session statistics
// @route   GET /api/pomodoro/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySessions = await PomodoroSession.find({
      user: req.user._id,
      sessionType: 'study',
      completedAt: { $gte: startOfToday }
    });

    const totalSessions = await PomodoroSession.countDocuments({
      user: req.user._id,
      sessionType: 'study'
    });

    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    res.status(200).json({
      success: true,
      todayCount: todaySessions.length,
      todayMinutes,
      totalCount: totalSessions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pomodoro stats', error: error.message });
  }
};
