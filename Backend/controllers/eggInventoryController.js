const EggInventory = require('../models/EggInventory');
const EggProduction = require('../models/EggProduction');

// GET /api/egg-inventory
exports.getEggInventory = async (req, res) => {
    try {
        const inventory = await EggInventory.find().sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// POST /api/egg-inventory/sales
exports.recordEggSale = async (req, res) => {
    try {
        const { buyer, quantity, saleDate } = req.body;

        if (!buyer || !buyer.name || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Buyer name and quantity are required'
            });
        }

        // Find latest inventory
        let inventory = await EggInventory.findOne().sort({ updatedAt: -1 });

        if (!inventory || inventory.remainingEggs < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Not enough eggs in inventory'
            });
        }

        inventory.soldEggs.push({
            buyer,
            quantity,
            saleDate: saleDate || new Date()
        });

        inventory.remainingEggs -= quantity;
        await inventory.save();

        res.status(200).json({
            success: true,
            message: 'Inventory updated successfully',
            data: inventory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// GET /api/egg-inventory/history?startDate=...&endDate=...
exports.getInventoryHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const inventoryHistory = await EggInventory.find(query)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: inventoryHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
