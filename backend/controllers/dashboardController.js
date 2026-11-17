const Task = require('../models/Task');
const Timetable = require('../models/Timetable');
const Assignment = require('../models/Assignment');
const StudyProgress = require('../models/StudyProgress');

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// @desc    Get complete dashboard overview data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Task metrics
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ user: userId, status: 'Pending' });

    // 2. Assignment metrics
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const assignments = await Assignment.find({ user: userId });
    const totalAssignments = assignments.length;
    
    const upcomingAssignments = assignments.filter((a) => {
      const d = new Date(a.deadline);
      return d >= now && d <= nextWeek && a.status !== 'Completed';
    });

    const overdueAssignments = assignments.filter((a) => {
      const d = new Date(a.deadline);
      return d < now && a.status !== 'Completed';
    });

    // 3. Today's Timetable
    const todayName = daysOfWeek[now.getDay()];
    const todayClasses = await Timetable.find({
      user: userId,
      day: todayName
    }).sort({ startTime: 1 });

    // 4. Study hours for the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLogs = await StudyProgress.find({
      user: userId,
      date: { $gte: sevenDaysAgo }
    });
    const weeklyStudyHours = recentLogs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);

    // 5. Recent pending tasks (top 5)
    const recentTasks = await Task.find({ user: userId, status: 'Pending' })
      .sort({ dueDate: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      student: {
        name: req.user.name,
        department: req.user.department,
        semester: req.user.semester
      },
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        totalAssignments,
        upcomingAssignmentsCount: upcomingAssignments.length,
        overdueAssignmentsCount: overdueAssignments.length,
        weeklyStudyHours: Number(weeklyStudyHours.toFixed(1))
      },
      todayClasses,
      upcomingAssignments,
      recentTasks,
      todayName
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard data', error: error.message });
  }
};
