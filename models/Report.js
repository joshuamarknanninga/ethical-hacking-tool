const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  testType: {
    type: String,
    required: true,
    enum: ['Penetration Testing', 'Vulnerability Assessment', 'Other'], // Predefined values
  },
  target: {
    type: String,
    required: true,
  },
  findings: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes to optimize querying by target and date
ReportSchema.index({ target: 1 });
ReportSchema.index({ date: -1 });

module.exports = mongoose.model('Report', ReportSchema);
