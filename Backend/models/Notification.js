const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['vaccination', 'inventory', 'mortality', 'signup', 'feed'],
    },
    read: {
      type: Boolean,
      default: false
    },
    userRole: {
      type: String,
      enum: ['admin', 'user'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
