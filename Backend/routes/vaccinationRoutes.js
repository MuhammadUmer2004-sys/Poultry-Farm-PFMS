const express = require('express');
const router = express.Router();
const {
  scheduleVaccination,
  getVaccinationRecords,
  deleteVaccination,
  getVaccinationHistory
} = require('../controllers/vaccinationController');

router.post('/', scheduleVaccination);
router.get('/:flockId', getVaccinationRecords);
router.delete('/:id', deleteVaccination);
router.get('/history/all', getVaccinationHistory); // GET /vaccination/history/all

module.exports = router;
