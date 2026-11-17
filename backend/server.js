/**
 * Student Productivity Hub - Main Server
 * --------------------------------------
 * Express.js application configured with MongoDB connection,
 * REST API routes, JWT security, and static frontend serving.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/pomodoro', require('./routes/pomodoroRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Student Productivity Hub API is live and healthy!',
    timestamp: new Date().toISOString()
  });
});

// Default route -> serve index.html (Login)
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Fallback 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🎓 Student Productivity Hub is live!`);
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
  console.log(`🩺 Health API URL:  http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);
});
