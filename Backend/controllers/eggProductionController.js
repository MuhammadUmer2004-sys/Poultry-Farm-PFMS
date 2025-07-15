const EggProduction = require('../models/EggProduction');
const EggInventory = require('../models/EggInventory');
const { validatePaginationParams, getPaginationMetadata } = require('../utils/pagination');
const { Parser } = require('json2csv');

exports.addEggProduction = async (req, res) => {
    try {
        const { date, totalEggs, notes } = req.body;

        // Check if a record for the date already exists
        const existingRecord = await EggProduction.findOne({ 
            date: new Date(date).toISOString().split('T')[0] 
        });
        
        if (existingRecord) {
            // Update existing record
            const updatedRecord = await EggProduction.findOneAndUpdate(
                { date: new Date(date).toISOString().split('T')[0] },
                { totalEggs, notes },
                { new: true } // Return the updated document
            );

            return res.status(200).json({ 
                success: true,
                data: updatedRecord,
                message: 'Production record updated successfully' 
            });
        }

        // Create egg production record
        const eggProduction = await EggProduction.create({ 
            date, 
            totalEggs, 
            notes 
        });

        // Update egg inventory
        const inventory = await EggInventory.findOne().sort({ createdAt: -1 });
        
        const newInventory = await EggInventory.create({
            totalEggs: (inventory?.remainingEggs || 0) + totalEggs,
            remainingEggs: (inventory?.remainingEggs || 0) + totalEggs,
            productionDate: date,
            soldEggs: []
        });

        res.status(201).json({
            success: true,
            data: {
                production: eggProduction,
                inventory: newInventory
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.exportEggProduction = async (req, res) => {
    try {
        const eggProductions = await EggProduction.find();

        if (eggProductions.length === 0) {
            return res.status(404).json({ message: 'No egg production records found' });
        }

        const fields = ['date', 'totalEggs', 'notes'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(eggProductions);

        // Set headers to force download
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="egg-production.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteEggProduction = async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the request parameters

        // Find and delete the egg production record
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 