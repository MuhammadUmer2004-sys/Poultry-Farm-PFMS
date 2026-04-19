const express = require('express');
const router = express.Router();
const { trackMortality, getMortalityRecords } = require('../controllers/mortalityController');

router.post('/', trackMortality);
router.get('/:flockId', getMortalityRecords);
router.delete('/:id', async (req, res, next) => {
    try {
        await require('../models/Mortality').findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Record deleted' });
    } catch (err) { next(err); }
});

module.exports = router;
