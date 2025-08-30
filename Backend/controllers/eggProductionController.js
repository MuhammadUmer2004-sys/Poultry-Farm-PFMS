const EggProduction = require('../models/EggProduction');
const EggInventory = require('../models/EggInventory');
const { validatePaginationParams, getPaginationMetadata } = require('../utils/pagination');
const { Parser } = require('json2csv');

// ✅ Add or Update Egg Production
exports.addEggProduction = async (req, res) => {
    try {
        const { date, totalEggs, notes } = req.body;

        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Check if production already exists for this date
        const existingProduction = await EggProduction.findOne({ 
            date: formattedDate 
        });

        let eggProduction;

        if (existingProduction) {
            // Update existing production record
            eggProduction = await EggProduction.findOneAndUpdate(
                { date: formattedDate },
                { totalEggs, notes },
                { new: true }
            );
        } else {
            // Create new production record
            eggProduction = await EggProduction.create({ 
                date: formattedDate, 
                totalEggs, 
                notes 
            });
        }

        // ✅ Update inventory
        const latestInventory = await EggInventory.findOne().sort({ createdAt: -1 });

        if (latestInventory) {
            // Update existing inventory
            latestInventory.remainingEggs += totalEggs;
            latestInventory.totalEggs += totalEggs;
            await latestInventory.save();
        } else {
            // Create new inventory if none exists
            await EggInventory.create({
                totalEggs,
                remainingEggs: totalEggs,
                productionDate: formattedDate,
                soldEggs: []
            });
        }

        res.status(200).json({
            success: true,
            message: existingProduction ? 'Production updated and inventory adjusted' : 'Production added and inventory updated',
            data: { production: eggProduction }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// ✅ Paginated GET /api/egg-production
exports.getEggProductionRecords = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { page: currentPage, limit: itemsPerPage } = validatePaginationParams(req.query);

        const totalItems = await EggProduction.countDocuments();
        const eggProductions = await EggProduction.find()
            .sort({ date: -1 })
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const paginationMetadata = getPaginationMetadata(currentPage, itemsPerPage, totalItems, req.originalUrl);

        res.status(200).json({
            success: true,
            data: eggProductions,
            pagination: paginationMetadata
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// ✅ Export to CSV
exports.exportEggProduction = async (req, res) => {
    try {
        const eggProductions = await EggProduction.find();

        if (eggProductions.length === 0) {
            return res.status(404).json({ message: 'No egg production records found' });
        }

        const fields = ['date', 'totalEggs', 'notes'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(eggProductions);

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="egg-production.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// ✅ Delete Production by ID
exports.deleteEggProduction = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRecord = await EggProduction.findByIdAndDelete(id);
        
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Egg production record not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Egg production record deleted successfully',
            data: deletedRecord
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};
