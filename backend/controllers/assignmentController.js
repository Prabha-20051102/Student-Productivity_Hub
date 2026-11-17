const Assignment = require('../models/Assignment');

// @desc    Get all assignments for the student
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const { status, subject } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (subject && subject !== 'All') {
      filter.subject = { $regex: subject, $options: 'i' };
    }

    const assignments = await Assignment.find(filter).sort({ deadline: 1 });

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Enrich with status flags
    const enriched = assignments.map((doc) => {
      const obj = doc.toObject();
      const deadlineDate = new Date(obj.deadline);
      obj.isOverdue = deadlineDate < now && obj.status !== 'Completed';
      obj.isUpcoming = deadlineDate >= now && deadlineDate <= sevenDaysFromNow && obj.status !== 'Completed';
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      assignments: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
};

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private
exports.createAssignment = async (req, res) => {
  try {
    const { title, subject, description, deadline, status } = req.body;

    if (!title || !subject || !deadline) {
      return res.status(400).json({ success: false, message: 'Please provide title, subject, and deadline' });
    }

    const assignment = await Assignment.create({
      user: req.user._id,
      title,
      subject,
      description: description || '',
      deadline,
      status: status || 'Not Started'
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully!',
      assignment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create assignment', error: error.message });
  }
};

// @desc    Update assignment details
// @route   PUT /api/assignments/:id
// @access  Private
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user._id });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const { title, subject, description, deadline, status } = req.body;

    if (title !== undefined) assignment.title = title;
    if (subject !== undefined) assignment.subject = subject;
    if (description !== undefined) assignment.description = description;
    if (deadline !== undefined) assignment.deadline = deadline;
    if (status !== undefined) assignment.status = status;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully!',
      assignment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update assignment', error: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete assignment', error: error.message });
  }
};
