const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const penetrationTest = require('../controllers/penetrationTest');
const vulnerabilityAssessment = require('../controllers/vulnerabilityAssessment');
const rateLimit = require('express-rate-limit');

// Rate limiter middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Apply rate limiting to the test execution route
router.use('/execute-test', limiter);

// Endpoint to execute a test
router.post('/execute-test', async (req, res) => {
  const { testType, target } = req.body;

  // Basic validation
  if (!testType || !target) {
    return res.status(400).json({ message: 'Test type and target are required' });
  }

  try {
    let findings = '';

    switch (testType) {
      case 'Penetration Testing':
        findings = await penetrationTest(target);
        break;
      case 'Vulnerability Assessment':
        findings = await vulnerabilityAssessment(target);
        break;
      // Handle other test types similarly...
      default:
        return res.status(400).json({ message: 'Invalid Test Type' });
    }

    // Save report to database
    const report = new Report({
      testType,
      target,
      findings,
    });

    await report.save();

    res.json({ message: 'Test executed successfully', findings });
  } catch (error) {
    console.error('Error executing test:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
