const { exec } = require('child_process');
const axios = require('axios'); // For interacting with OWASP ZAP API
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer'); // For sending email notifications

// Function to save the web application test results to a file
const saveWebAppTestReport = (testResults, target, format = 'txt') => {
  const reportFilePath = path.join(__dirname, `../reports/web_app_test_${target}_${Date.now()}.${format}`);
  fs.writeFileSync(reportFilePath, testResults);
  return reportFilePath;
};

// Function to send email notifications when a scan completes
const sendNotification = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: subject,
    text: message
  };

  return transporter.sendMail(mailOptions);
};

// Function to perform a web application test using OWASP ZAP with customizable options
const webAppTest = async (target, scanOptions = {}) => {
  return new Promise((resolve, reject) => {
    // Construct the OWASP ZAP CLI command with customizable options
    let command = `zap-cli quick-scan --start-options '-config api.key=12345' ${target}`;

    if (scanOptions.fullScan) {
      command = `zap-cli full-scan --start-options '-config api.key=12345' ${target}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error during web app test: ${stderr}`);
      }

      // Save the raw scan results to a file
      const reportFilePath = saveWebAppTestReport(stdout, target, 'txt');

      resolve(`Web App Test for ${target} completed. Report saved at: ${reportFilePath}`);
    });
  });
};

// Function to initiate a session-based authenticated scan via OWASP ZAP API
const zapApiSessionAuthScan = async (target, zapApiUrl, zapApiKey, sessionDetails) => {
  try {
    // Perform login and retrieve session token or cookie
    const loginResponse = await axios.post(`${zapApiUrl}/JSON/authentication/action/login/`, null, {
      params: {
        apikey: zapApiKey,
        url: sessionDetails.loginUrl,
        username: sessionDetails.username,
        password: sessionDetails.password
      }
    });

    const sessionToken = loginResponse.data.sessionToken; // Example: Retrieve session token from login response

    // Start the scan after authentication
    const startScanResponse = await axios.post(`${zapApiUrl}/JSON/ascan/action/scan/`, null, {
      params: {
        url: target,
        apikey: zapApiKey,
        sessionToken // Pass the session token or cookie for authenticated scan
      }
    });
    const scanId = startScanResponse.data.scan;

    return `Session-based OWASP ZAP API scan initiated for ${target}. Scan ID: ${scanId}`;
  } catch (error) {
    throw new Error(`Error initiating session-based OWASP ZAP API scan: ${error.message}`);
  }
};

// Function to monitor the scan progress via OWASP ZAP API with notification support
const zapApiScanProgressWithNotification = async (scanId, zapApiUrl, zapApiKey, email) => {
  try {
    let progress = 0;
    // Poll the scan status until the scan completes
    while (progress < 100) {
      const progressResponse = await axios.get(`${zapApiUrl}/JSON/ascan/view/status/`, {
        params: {
          scanId: scanId,
          apikey: zapApiKey
        }
      });
      progress = parseInt(progressResponse.data.status, 10);
      console.log(`Scan Progress: ${progress}%`);
      
      // Sleep for a few seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Send notification upon completion
    await sendNotification(email, 'OWASP ZAP Scan Completed', `Scan ID: ${scanId} completed successfully.`);

    return `Scan ID: ${scanId} completed successfully. Notification sent to ${email}.`;
  } catch (error) {
    throw new Error(`Error monitoring OWASP ZAP API scan progress: ${error.message}`);
  }
};

// Function to fetch the web application test report via OWASP ZAP API
const fetchZapApiReport = async (scanId, zapApiUrl, zapApiKey, format = 'json') => {
  try {
    // Fetch the scan report via OWASP ZAP API
    const reportResponse = await axios.get(`${zapApiUrl}/JSON/core/view/alerts/`, {
      params: {
        baseurl: '',
        apikey: zapApiKey
      }
    });

    const report = reportResponse.data;

    // Save the report to a file
    const reportFilePath = saveWebAppTestReport(JSON.stringify(report, null, 2), scanId, format);

    return `Web Application Test Report for Scan ID: ${scanId} fetched and saved at: ${reportFilePath}`;
  } catch (error) {
    throw new Error(`Error fetching OWASP ZAP API report: ${error.message}`);
  }
};

module.exports = { webAppTest, zapApiSessionAuthScan, zapApiScanProgressWithNotification, fetchZapApiReport };
