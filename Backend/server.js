const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// ✅ Middleware - allow all origins for Vercel compatibility
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// ✅ MongoDB Connection (no process.exit - breaks Vercel serverless)
let isConnected = false;
let lastError = null;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    lastError = null;
    console.log('✅ MongoDB connected');
  } catch (err) {
    lastError = err.message;
    console.error('❌ MongoDB connection error:', err.message);
    // Do NOT call process.exit() - it crashes Vercel serverless functions
  }
};

connectDB();

// ✅ Route Imports
const authRoutes = require('./routes/authRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const mortalityRoutes = require('./routes/mortalityRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const feedRoutes = require('./routes/feedRoutes');
const eggProductionRoutes = require('./routes/eggProductionRoutes');
const eggInventoryRoutes = require('./routes/eggInventoryRoutes');
const userDashboardRoutes = require('./routes/userDashboardRoutes');
const flockRoutes = require('./routes/flockRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    db: isConnected ? 'connected' : 'disconnected',
    error: lastError || null,
    mongo_uri_set: !!process.env.MONGO_URI,
    uri_preview: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 30) + '...' : 'NOT SET'
  });
});

// ✅ Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/mortality', mortalityRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/revenues', revenueRoutes);
app.use('/api/feeds', feedRoutes);
app.use('/api/egg-production', eggProductionRoutes);
app.use('/api/egg-inventory', eggInventoryRoutes);
app.use('/api/user-dashboard', userDashboardRoutes);
app.use('/api/flock', flockRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Load Schedulers only in local development
if (!process.env.VERCEL) {
  require('./schedulers/vaccinationReminder');
}

// ✅ Start Server (Only when not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// ✅ Export app for Vercel
module.exports = app;
