const Vaccination = require('../models/Vaccination');
const Flock = require('../models/Flock');
const moment = require('moment');

// ✅ Schedule a new vaccination (future or present)
exports.scheduleVaccination = async (req, res) => {
  try {
    const { flockId, vaccineType, administrationDate, notes } = req.body;

    const flock = await Flock.findById(flockId);
    if (!flock) {
      return res.status(404).json({ message: 'Flock not found' });
    }

    const vacDate = new Date(administrationDate);
    if (isNaN(vacDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const vaccination = await Vaccination.create({
      flock: flockId,
      vaccineType,
      administrationDate: vacDate,
      notes
    });

    flock.vaccinationRecords.push(vaccination._id);
    await flock.save();

    res.status(201).json({ success: true, vaccination });
  } catch (error) {
    console.error('Error scheduling vaccination:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get all vaccinations for a flock (any date)
exports.getVaccinationRecords = async (req, res) => {
  try {
    const { flockId } = req.params;
    const vaccinations = await Vaccination.find({ flock: flockId }).sort({ administrationDate: 1 });
    res.status(200).json({ success: true, vaccinations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Delete a specific vaccination record
exports.deleteVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    await Vaccination.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get past vaccinations only (history)
exports.getVaccinationHistory = async (req, res) => {
  try {
    const today = moment().startOf('day').toDate();

    const history = await Vaccination.find({
      administrationDate: { $lt: today }
    }).sort({ administrationDate: -1 });

    res.json(history);
  } catch (error) {
    console.error('Failed to fetch vaccination history:', error.message);
    res.status(500).json({ error: 'Server error fetching history' });
  }
};
