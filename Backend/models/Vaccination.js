const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
    flock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flock',
        required: true
    },
    vaccineType: {
        type: String,
        required: true
    },
    administrationDate: {
        type: Date,
        required: true
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Vaccination', vaccinationSchema);
