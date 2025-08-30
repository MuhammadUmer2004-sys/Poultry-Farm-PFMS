const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

const {
    addEggProduction,
    getEggProductionRecords,
    exportEggProduction,
    deleteEggProduction
} = require('../controllers/eggProductionController');

// ✅ Route: POST /api/egg-production → Add or Update Production and Sync Inventory
router.post('/', protect, addEggProduction);

// ✅ Route: GET /api/egg-production → Paginated List of Records
router.get('/', protect, getEggProductionRecords);

// ✅ Route: GET /api/egg-production/export → Download CSV
router.get('/export', protect, exportEggProduction);

// ✅ Route: DELETE /api/egg-production/:id → Delete Record by ID
router.delete('/:id', protect, deleteEggProduction);

module.exports = router;
