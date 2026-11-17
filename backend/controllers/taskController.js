const Task = require('../models/Task');

// @desc    Get all tasks for the logged in student
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Sort by dueDate ascending, then priority
    const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide task title and due date' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      priority: priority || 'Medium',
      dueDate,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }

    const { title, description, priority, dueDate, status } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) {
      task.status = status;
      task.completedAt = status === 'Completed' ? new Date() : null;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully!',
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
};

// @desc    Toggle task status between Pending and Completed
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
    task.completedAt = task.status === 'Completed' ? new Date() : null;

    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.status}`,
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
  }
};
