const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// ✅ Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ✅ MongoDB Connection with proper serverless caching
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    });
    console.log('✅ MongoDB connected');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    cachedConnection = null;
    throw err;
  }
};

// ✅ Middleware: Connect DB before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection middleware error:', err.message);
    next(); // Still proceed even if DB fails (routes will handle errors)
  }
});

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
  const state = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'OK',
    db: states[state] || 'unknown',
    readyState: state,
    mongo_uri_set: !!process.env.MONGO_URI,
    uri_preview: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 35) + '...' : 'NOT SET'
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
