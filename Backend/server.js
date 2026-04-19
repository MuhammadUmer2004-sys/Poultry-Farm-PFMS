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
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
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
app.use('/api/notifications', notificationRoutes); // ✅ Notifications

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Load Schedulers (CRON jobs)
require('./schedulers/vaccinationReminder'); // 🔔 Vaccination + Feed Alerts

// ✅ Start Server (Only when not on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// ✅ Export app for Vercel
module.exports = app;
