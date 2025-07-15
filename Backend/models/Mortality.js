const mongoose = require('mongoose');

const mortalitySchema = new mongoose.Schema({
    flock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flock',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    numberOfDeaths: {
        type: Number,
        required: true
    },
    cause: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Mortality', mortalitySchema);
