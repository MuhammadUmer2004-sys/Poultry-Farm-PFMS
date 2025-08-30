const Expense = require('../models/Expense');
const { validatePaginationParams, getPaginationMetadata } = require('../utils/pagination');
const { Parser } = require('json2csv');

// ➕ Add Expense
const addExpense = async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    const saved = await newExpense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Get Expenses (Paginated)
const getExpenses = async (req, res) => {
  try {
    const { page, limit } = validatePaginationParams(req.query);
    const total = await Expense.countDocuments();

    const expenses = await Expense.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: getPaginationMetadata(page, limit, total, req.originalUrl),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Expense
const updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete Expense
const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Advanced Filters
const getAdvancedExpenses = async (req, res) => {
  try {
    const { type, minDate, maxDate, sortBy, order = 'asc', page = 1, limit = 10 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (minDate || maxDate) {
      query.date = {};
      if (minDate) query.date.$gte = new Date(minDate);
      if (maxDate) query.date.$lte = new Date(maxDate);
    }

    const sortOptions = sortBy ? { [sortBy]: order === 'desc' ? -1 : 1 } : {};
    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Expense.countDocuments(query);

    res.status(200).json({ total, page: +page, limit: +limit, expenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Total by type
const getTotalExpensesByType = async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) return res.status(400).json({ error: 'Type query parameter is required' });

    const total = await Expense.aggregate([
      { $match: { type } },
      { $group: { _id: '$type', totalAmount: { $sum: '$amount' } } },
    ]);

    if (!total.length) return res.status(404).json({ message: `No expenses for type: ${type}` });

    res.status(200).json({ type, totalAmount: total[0].totalAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📉 Average Expense
const getAverageExpense = async (req, res) => {
  try {
    const { minDate, maxDate } = req.query;
    const query = {};

    if (minDate || maxDate) {
      query.date = {};
      if (minDate) query.date.$gte = new Date(minDate);
      if (maxDate) query.date.$lte = new Date(maxDate);
    }

    const average = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, averageAmount: { $avg: '$amount' } } },
    ]);

    if (!average.length) return res.status(404).json({ message: 'No data found' });

    res.status(200).json({ averageAmount: average[0].averageAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📁 Export CSV
const exportExpensesToCSV = async (req, res) => {
  try {
    const { type, minDate, maxDate } = req.query;
    const query = {};

    if (type) query.type = type;
    if (minDate || maxDate) {
      query.date = {};
      if (minDate) query.date.$gte = new Date(minDate);
      if (maxDate) query.date.$lte = new Date(maxDate);
    }

    const expenses = await Expense.find(query).lean();
    if (!expenses.length) return res.status(404).json({ message: 'No data to export' });

    const fields = ['type', 'amount', 'description', 'date'];
    const parser = new Parser({ fields });
    const csv = parser.parse(expenses);

    res.header('Content-Type', 'text/csv');
    res.attachment('expenses.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getAdvancedExpenses,
  getTotalExpensesByType,
  getAverageExpense,
  exportExpensesToCSV,
};
