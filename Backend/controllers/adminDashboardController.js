const User = require('../models/User');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const EggProduction = require('../models/EggProduction');

// @desc    Get admin dashboard summary
// @route   GET /api/admin-dashboard/dashboard
// @access  Private/Admin
exports.getAdminDashboard = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();

    // Calculate total revenue
    const revenueAgg = await Revenue.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    // Calculate total expenses
    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const expense = expenseAgg[0]?.total || 0;

    // Compute profits
    const totalProfits = revenue - expense;

    // Total eggs produced
    const eggAgg = await EggProduction.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEggs' } } }
    ]);
    const totalEggsProduced = eggAgg[0]?.total || 0;

    // ✅ Return wrapped data object for frontend
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProfits,
        totalEggsProduced
      }
    });
  } catch (error) {
    console.error('❌ Admin Dashboard Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data',
      error: error.message
    });
  }
};
