const mongoose = require('mongoose');

const RevenueSchema = new mongoose.Schema({
  source: { type: String, required: true }, // e.g., Sales, Investment
  amount: { type: Number, required: true }, // Revenue amount
  date: { type: Date, default: Date.now },  // Default to current date
  description: { type: String },           // Optional description
});

module.exports = mongoose.model('Revenue', RevenueSchema);
