const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  testType: {
    type: String,
    required: true,
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

module.exports = mongoose.model('Report', ReportSchema);
