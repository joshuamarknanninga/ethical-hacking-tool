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
    type: Dat