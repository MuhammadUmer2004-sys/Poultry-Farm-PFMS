const mongoose = require('mongoose');

const flockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  numberOfHens: {
    type: Number,
    required: true,
    min: [0, 'Number of hens cannot be negative']
  },
  healthStatus: {
    type: String,
    enum: ['Healthy', 'Sick', 'Quarantined'],
    default: 'Healthy'
  },
  vaccinationRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vaccination'
    }
  ],
  mortalityRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mortality'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Flock', flockSchema);
