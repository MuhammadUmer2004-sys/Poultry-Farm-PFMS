const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');
const Notification = require('../models/Notification');

// ✅ Get unread notifications for the current user role
router.get('/', protect, getNotifications);

// ✅ Mark a specific notification as read (with auth)
router.patch('/:id/read', protect, markNotificationRead);

// 🔄 OPTIONAL: Direct patch route for testing or internal use (no auth)
router.patch('/:id/read-direct', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notif);
  } catch {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

module.exports = router;
