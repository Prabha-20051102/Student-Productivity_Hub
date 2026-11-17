const express = require('express');
const router = express.Router();
const {
  getProgress,
  addProgress,
  deleteProgress,
  getProgressSummary
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getProgressSummary);

router.route('/')
  .get(getProgress)
  .post(addProgress);

router.delete('/:id', deleteProgress);

module.exports = router;
