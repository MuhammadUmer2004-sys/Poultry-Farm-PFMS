const Feed = require('../models/Feed');
const { validatePaginationParams, getPaginationMetadata } = require('../utils/pagination');
const { Parser } = require('json2csv');

exports.addFeed = async (req, res) => {
    try {
        const { name, quantity, supplier } = req.body;

        const feed = await Feed.create({ name, quantity, supplier });

        res.status(201).json({
            success: true,
            feed
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateFeedQuantity = async (req, res) => {
    try {
        const { feedId, amountUsed } = req.body;

        const feed = await Feed.findById(feedId);
        if (!feed) {
            return res.status(404).json({ message: 'Feed not found' });
        }

        feed.quantity -= amountUsed;
        feed.usageRecords.push({ amountUsed });
        await feed.save();

        res.status(200).json({
            success: true,
            feed
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getFeedInventory = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { page: currentPage, limit: itemsPerPage } = validatePaginationParams(req.query);

        const totalItems = await Feed.countDocuments();
        const feeds = await Feed.find()
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const paginationMetadata = getPaginationMetadata(currentPage, itemsPerPage, totalItems, req.originalUrl);

        res.status(200).json({
            success: true,
            data: feeds,
            pagination: paginationMetadata
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 

exports.deleteFeed = async (req, res) => {
    try {
        const { id } = req.params;
        await Feed.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Feed deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.exportFeed = async (req, res) => {
    try {
        const feeds = await Feed.find(); // Fetch all feed records

        if (feeds.length === 0) {
            return res.status(404).json({ message: 'No feed records found' });
        }

        const fields = ['name', 'quantity', 'supplier.name', 'orderDate']; // Define the fields to export
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(feeds);

        // Set headers to force download
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="feed-inventory.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
