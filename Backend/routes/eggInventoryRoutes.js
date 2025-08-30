const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
    getEggInventory, 
    recordEggSale 
} = require('../controllers/eggInventoryController');

// ✅ Fix route: POST should go to /sales
router.get('/', protect, getEggInventory);
router.post('/sales', protect, recordEggSale); 

module.exports = router;
