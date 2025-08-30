const express = require('express');
const router = express.Router();

const {
  addFlock,
  updateFlock,
  getFlocks,
  deleteFlock,
  exportFlocksToCSV
} = require('../controllers/flockController');

const { protect } = require('../middlewares/authMiddleware');

// ✅ All flock routes are protected
router.post('/', protect, addFlock);             // ➕ Add new flock
router.put('/:id', protect, updateFlock);        // ✏️ Update flock by ID
router.get('/', protect, getFlocks);             // 📄 Get all flocks
router.delete('/:id', protect, deleteFlock);     // ❌ Delete flock by ID
router.get('/export', protect, exportFlocksToCSV); // 📤 Export CSV

module.exports = router;