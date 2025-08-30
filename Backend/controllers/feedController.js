// controllers/feedController.js
const Feed = require('../models/Feed');
const { Parser } = require('json2csv');

// ✅ Add new feed
exports.addFeed = async (req, res) => {
  try {
    const { name, quantity, supplier } = req.body;

    const feed = await Feed.create({
      name,
      quantity,
      supplier,
      usageRecords: [],
      orderDate: new Date()
    });

    res.status(201).json({
      success: true,
      feed
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Record feed usage
exports.recordFeedUsage = async (req, res) => {
  try {
    const { feedId, amountUsed, usageDate } = req.body;

    const feed = await Feed.findById(feedId);
    if (!feed) {
      return res.status(404).json({ success: false, message: 'Feed not found' });
    }

    if (amountUsed > feed.quantity) {
      return res.status(400).json({ success: false, message: 'Not enough feed quantity available' });
    }

    feed.quantity -= amountUsed;
    feed.usageRecords.push({
      amountUsed,
      usageDate: usageDate || new Date()
    });

    await feed.save();

    res.status(200).json({
      success: true,
      message: 'Feed usage recorded successfully',
      feed
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ Get feed inventory
exports.getFeedInventory = async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: feeds
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Delete feed
exports.deleteFeed = async (req, res) => {
  try {
    const { id } = req.params;
    await Feed.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Feed deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Export feed as CSV
exports.exportFeed = async (req, res) => {
  try {
    const feeds = await Feed.find();

    if (feeds.length === 0) {
      return res.status(404).json({ message: 'No feed records found' });
    }

    const fields = ['name', 'quantity', 'supplier.name', 'orderDate'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(feeds);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="feed-inventory.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// ✅ Update feed by ID
exports.updateFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Feed.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Feed not found' });

    res.status(200).json({ success: true, message: 'Feed updated', feed: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

