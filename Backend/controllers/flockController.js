const { Parser } = require('json2csv');
const Flock = require('../models/Flock');

// ➕ Add a new flock
exports.addFlock = async (req, res) => {
  try {
    const { name, breed, numberOfHens, healthStatus, acquisitionDate } = req.body;
    if (!name || !breed || numberOfHens == null || !healthStatus) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newFlock = new Flock({
      name,
      breed,
      numberOfHens,
      healthStatus,
      acquisitionDate: acquisitionDate || new Date()
    });

    const savedFlock = await newFlock.save();
    res.status(201).json({ success: true, data: savedFlock });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✏️ Update a flock by ID
exports.updateFlock = async (req, res) => {
  try {
    const { name, breed, numberOfHens, healthStatus, acquisitionDate } = req.body;

    const updated = await Flock.findByIdAndUpdate(
      req.params.id,
      { name, breed, numberOfHens, healthStatus, acquisitionDate },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Flock not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 📄 Get all flocks
exports.getFlocks = async (req, res) => {
  try {
    const flocks = await Flock.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: flocks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ❌ Delete a flock
exports.deleteFlock = async (req, res) => {
  try {
    const deleted = await Flock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Flock not found' });

    res.status(200).json({ success: true, message: 'Flock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 📤 Export flock data as CSV
exports.exportFlocksToCSV = async (req, res) => {
  try {
    const flocks = await Flock.find().lean();

    if (flocks.length === 0) {
      return res.status(404).json({ message: 'No flock records found' });
    }

    const fields = ['name', 'breed', 'numberOfHens', 'healthStatus', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(flocks);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="flock-data.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
