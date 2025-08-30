const express = require('express');
const router = express.Router();
const {
  addFeed,
  recordFeedUsage,
  getFeedInventory,
  deleteFeed,
  exportFeed,
  updateFeed // ✅ Add updateFeed controller
} = require('../controllers/feedController');

const { protect } = require('../middlewares/authMiddleware');

// ✅ All routes are protected (require a valid token)

// ➕ Add new feed
router.post('/', protect, addFeed);

// 📝 Record feed usage
router.post('/usage', protect, recordFeedUsage);

// 📦 Get all feed inventory
router.get('/', protect, getFeedInventory);

// ✏️ Update feed by ID (NEW)
router.put('/:id', protect, updateFeed);

// 🗑️ Delete feed by ID
router.delete('/:id', protect, deleteFeed);

// 📤 Export feed data as CSV
router.get('/export', protect, exportFeed);

module.exports = router;
