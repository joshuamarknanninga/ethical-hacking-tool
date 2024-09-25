const { exec } = require('child_process');
const fetch = require('node-fetch'); // For interacting with external phishing APIs (e.g., GoPhish)
const { escape } = require('shell-escape'); // Sanitize input
const fs = require('fs');
const path = require('path');

// Function to log phishing interaction events (clicks, open rates, data submission)
const trackPhishingMetrics = async (campaignId, gophishApiKey) => {
  const url = `http://localhost:3333/api/campaigns/${campaignId}/results?api_key=${gophishApiKey}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const results = await response.json();

    // Calculate metrics (time-to-click, open rates, data submissions)
    const clickEvents = results.filter(event => event.status === 'Clicked Link');
    const submitEvents = results.filter(event => event.status === 'Submitted Data');
    const openEvents = results.filter(event => event.status === 'Email Opened');

    const firstClick = clickEvents.length > 0 ? new Date(clickEvents[0].time) : null;
    const metrics = {
      totalEmailsSent: results.length,
      totalOpens: openEvents.length,
      totalClicks: clickEvents.length,
      totalSubmissions: submitEvents.length,
      timeToFirstClick: firstClick ? firstClick.toISOString() : 'No clicks recorded',
    };

    // Save interaction metrics to a file
    const metricsLogPath = path.join(__dirname, `../reports/phishing_metrics_${campaignId}_${Date.now()}.json`);
    fs.writeFileSync(metricsLogPath, JSON.stringify(metrics, null, 2));

    return `Phishing metrics log saved at ${metricsLogPath}`;
  } catch (error) {
    return `Error tracking phishing metrics: ${error.message}`;
  }
};

// Function to send phishing email via GoPhish API with custom templates
const sendPhishingSimulation = async (targetEmail, campaignId, gophishApiKey, emailTemplateId) => {
  const url = `http://localhost:3333/api/campaigns/${campaignId}/launch?api_key=${gophishApiKey}`;

  // Customize phishing payload with email template
  const phishingPayload = {
    targets: [
      {
        email: targetEmail,
        first_name: 'Target',
        last_name: 'User',
        position: 'Employee',
      },
    ],
    email_template_id: emailTemplateId,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phishingPayload),
    });

    const result = await response.json();

    if (response.ok) {
      const trackResult = await trackPhishingMetrics(campaignId, gophishApiKey);
      return `Phishing simulation sent to ${targetEmail}. Campaign ID: ${campaignId}. ${trackResult}`;
    } else {
      return `Failed to send phishing simulation to ${targetEmail}. Error: ${result.message}`;
    }
  } catch (error) {
    return `Error while sending phishing simulation: ${error.message}`;
  }
};

// Function to log detailed pretexting simulations (track target responses over time)
const pretextingSimulation = (target, fakeIdentity, interactionDetails = {}) => {
  const logPath = path.join(__dirname, `../reports/pretexting_log_${target}_${Date.now()}.json`);
  const logMessage = {
    target: target,
    fakeIdentity: fakeIdentity,
    interactionDetails: interactionDetails,
    timestamp: new Date().toISOString(),
  };

  // Save pretexting log
  fs.writeFileSync(logPath, JSON.stringify(logMessage, null, 2));

  return `Pretexting simulation for ${target} executed. Fake identity used: ${fakeIdentity}. Log saved at ${logPath}.`;
};

// Function to log baiting simulations and track interactions
const baitingSimulation = (location, baitType, interactionDetails = {}) => {
  const logPath = path.join(__dirname, `../reports/baiting_log_${location}_${Date.now()}.json`);
  const logMessage = {
    location: location,
    baitType: baitType,
    interactionDetails: interactionDetails,
    timestamp: new Date().toISOString(),
  };

  // Save baiting log
  fs.writeFileSync(logPath, JSON.stringify(logMessage, null, 2));

  return `Baiting simulation executed at ${location} with bait type: ${baitType}. Log saved at ${logPath}.`;
};

// Main function for social engineering test, integrating phishing and other tactics
const socialEngineering = async (targetEmail, tactic = 'phishing', extraParams = {}) => {
  const gophishApiKey = 'your_gophish_api_key'; // Replace with actual API key
  const campaignId = '123'; // Replace with real campaign ID from GoPhish or similar tool
  const emailTemplateId = extraParams.emailTemplateId || 'default_template_id'; // Customize the email template ID

  try {
    switch (tactic.toLowerCase()) {
      case 'phishing':
        return await sendPhishingSimulation(targetEmail, campaignId, gophishApiKey, emailTemplateId);

      case 'pretexting':
        const fakeIdentity = extraParams.fakeIdentity || 'CEO John Doe';
        const pretextingDetails = extraParams.interactionDetails || {};
        return pretextingSimulation(targetEmail, fakeIdentity, pretextingDetails);

      case 'baiting':
        const location = extraParams.location || 'Company Parking Lot';
        const baitType = extraParams.baitType || 'USB Drive';
        const baitingDetails = extraParams.interactionDetails || {};
        return baitingSimulation(location, baitType, baitingDetails);

      default:
        return `Social Engineering Test failed. Tactic "${tactic}" is not recognized.`;
    }
  } catch (error) {
    return `Social Engineering Test for ${targetEmail} failed. Error: ${error.message}`;
  }
};

module.exports = socialEngineering;
