const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

const {
    addEggProduction,
    getEggProductionRecords,
    exportEggProduction,
    deleteEggProduction
} = require('../controllers/eggProductionController');

// ✅ Route: POST /api/egg-production → Add record
router.post('/', protect, addEggProduction);

// ✅ Route: PUT /api/egg-production/:id → Update record
router.put('/:id', protect, async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await require('../models/EggProduction').findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, data: updated });
    } catch (err) { next(err); }
});

// ✅ Route: GET /api/egg-production → Paginated List of Records
router.get('/', protect, getEggProductionRecords);

// ✅ Route: GET /api/egg-production/export → Download CSV
router.get('/export', protect, exportEggProduction);

// ✅ Route: DELETE /api/egg-production/:id → Delete Record by ID
router.delete('/:id', protect, deleteEggProduction);

module.exports = router;
