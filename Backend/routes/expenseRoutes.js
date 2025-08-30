const express = require('express');
const router = express.Router();
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getAdvancedExpenses,
  getTotalExpensesByType,
  getAverageExpense,
  exportExpensesToCSV
} = require('../controllers/expenseController');

// Expense Management Routes
router.post('/add', addExpense);
router.get('/', getExpenses);
router.get('/advanced', getAdvancedExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.get('/total-by-type', getTotalExpensesByType);
router.get('/average', getAverageExpense);
router.get('/export', exportExpensesToCSV);

module.exports = router;
