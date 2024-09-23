const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// Import Testing Controllers
const penetrationTest = require('../controllers/penetrationTest');
const vulnerabilityAssessment = require('../controllers/vulnerabilityAssessment');
// Import other controllers similarly...

// Endpoint to execute a test
router.post('/execute-test', async (req, res) => {
  const { testType, target } = req.body;

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
