const cron = require('node-cron');
const moment = require('moment');
const Vaccination = require('../models/Vaccination');
const Feed = require('../models/Feed');
const Notification = require('../models/Notification');

// Runs daily at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const today = moment().startOf('day');
    const endOfToday = moment().endOf('day');
    const tomorrow = moment().add(1, 'days').startOf('day');
    const endOfTomorrow = moment(tomorrow).endOf('day');

    // ✅ 1. Vaccination due today
    const dueToday = await Vaccination.find({
      administrationDate: { $gte: today.toDate(), $lte: endOfToday.toDate() }
    });

    for (let vac of dueToday) {
      const message = `Vaccination for flock ID ${vac.flock} is due today (${moment(vac.administrationDate).format('YYYY-MM-DD')})`;

      const exists = await Notification.findOne({
        message,
        type: 'vaccination',
        createdAt: { $gte: today.toDate(), $lte: endOfToday.toDate() }
      });

      if (!exists) {
        await Notification.create({
          title: 'Vaccination Due Today',
          message,
          type: 'vaccination',
          userRole: 'user',
          read: false
        });
      }
    }

    // ✅ 2. Vaccination due tomorrow
    const dueTomorrow = await Vaccination.find({
      administrationDate: { $gte: tomorrow.toDate(), $lte: endOfTomorrow.toDate() }
    });

    for (let vac of dueTomorrow) {
      const message = `Vaccination for flock ID ${vac.flock} is due tomorrow (${moment(vac.administrationDate).format('YYYY-MM-DD')})`;

      const exists = await Notification.findOne({
        message,
        type: 'vaccination',
        createdAt: { $gte: today.toDate(), $lte: endOfToday.toDate() }
      });

      if (!exists) {
        await Notification.create({
          title: 'Vaccination Due Tomorrow',
          message,
          type: 'vaccination',
          userRole: 'user',
          read: false
        });
      }
    }

    // ✅ 3. Feed quantity low alert
    const lowFeeds = await Feed.find({ quantity: { $lt: 10 } });

    for (let feed of lowFeeds) {
      const message = `Feed ${feed.name} is low (${feed.quantity} kg remaining). Please restock.`;

      const exists = await Notification.findOne({
        message,
        type: 'feed',
        createdAt: { $gte: today.toDate(), $lte: endOfToday.toDate() }
      });

      if (!exists) {
        await Notification.create({
          title: 'Low Feed Alert',
          message,
          type: 'feed',
          userRole: 'user',
          read: false
        });
      }
    }

    console.log(`✅ Scheduler ran: ${dueToday.length} due today, ${dueTomorrow.length} due tomorrow, ${lowFeeds.length} low feed`);
  } catch (err) {
    console.error('❌ Scheduler failed:', err.message);
  }
});
