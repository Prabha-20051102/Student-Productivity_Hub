const express = require('express');
const router = express.Router();
const { logSession, getStats } = require('../controllers/pomodoroController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/session', logSession);
router.get('/stats', getStats);

module.exports = router;
