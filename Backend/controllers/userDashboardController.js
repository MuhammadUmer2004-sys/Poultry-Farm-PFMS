const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const EggProduction = require('../models/EggProduction');
const Mortality = require('../models/Mortality');
const Feed = require('../models/Feed');
const EggInventory = require('../models/EggInventory');

exports.getDashboardData = async (req, res) => {
    try {
        // Fetch egg production data
        const eggProductionData = await EggProduction.find().sort({ date: -1 });
        const totalEggsProduced = eggProductionData.reduce((acc, record) => acc + record.totalEggs, 0);

        // Fetch mortality data
        const mortalityData = await Mortality.find().sort({ date: -1 });
        const totalMortality = mortalityData.reduce((acc, record) => acc + record.numberOfDeaths, 0);

        // Fetch feed usage data
        const feedData = await Feed.find();
        const totalFeedUsed = feedData.reduce((acc, feed) => acc + feed.usageRecords.reduce((sum, record) => sum + record.amountUsed, 0), 0);

        // Fetch egg inventory data
        const eggInventoryData = await EggInventory.find();
        const totalEggsInInventory = eggInventoryData.reduce((acc, record) => acc + record.totalEggs, 0);

        // Fetch total revenue and expenses for analytics
        const totalRevenue = await Revenue.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
        const totalExpense = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);

        const revenue = totalRevenue[0]?.total || 0;
        const expense = totalExpense[0]?.total || 0;
        const totalProfits = revenue - expense;

        // Fetch trends over time
        const revenueTrends = await Revenue.aggregate([
            { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const expenseTrends = await Expense.aggregate([
            { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Fetch breakdown by type
        const revenueBreakdown = await Revenue.aggregate([
            { $group: { _id: '$source', total: { $sum: '$amount' } } }
        ]);

        const expenseBreakdown = await Expense.aggregate([
            { $group: { _id: '$type', total: { $sum: '$amount' } } }
        ]);

        // Alerts
        const lowFeedAlert = feedData.some(feed => feed.quantity < 10); // Example threshold
        const highMortalityAlert = totalMortality > 50; // Example threshold

        res.status(200).json({
            success: true,
            totalEggsProduced,
            totalMortality,
            totalFeedUsed,
            totalEggsInInventory,
            totalProfits,
            revenueTrends,
            expenseTrends,
            revenueBreakdown,
            expenseBreakdown,
            alerts: {
                lowFeed: lowFeedAlert,
                highMortality: highMortalityAlert
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 