const Notification = require('../models/Notification');

// ✅ Get unread notifications based on user role
exports.getNotifications = async (req, res) => {
  const role = req.user?.role || 'user';

  try {
    const notifications = await Notification.find({
      userRole: role,
      read: false
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// ✅ Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Notification.findByIdAndUpdate(id, { read: true });

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};
