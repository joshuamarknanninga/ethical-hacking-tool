const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer'); // For sending email alerts

// Function to save wireless test results to a file
const saveWirelessTestReport = (testResults, target, format = 'txt') => {
  const reportFilePath = path.join(__dirname, `../reports/wireless_test_${target}_${Date.now()}.${format}`);
  fs.writeFileSync(reportFilePath, testResults);
  return reportFilePath;
};

// Function to parse wireless scan results and extract network details
const parseWirelessTestResults = (testResults) => {
  const networks = [];
  const lines = testResults.split('\n');

  lines.forEach(line => {
    const columns = line.trim().split(/\s+/);

    // Extract SSID, BSSID, Signal Strength, and Channel from the scan results
    if (columns.length >= 5) {
      const ssid = columns[columns.length - 1];
      const bssid = columns[0];
      const signalStrength = columns[2];
      const channel = columns[1];

      networks.push({
        SSID: ssid,
        BSSID: bssid,
        SignalStrength: signalStrength,
        Channel: channel
      });
    }
  });

  return networks;
};

// Function to send email alerts when specific networks or vulnerabilities are detected
const sendAlert = async (email, subject, message) => {
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

// Function to perform a wireless network test using airodump-ng with customizable options
const wirelessTest = async (target, testOptions = {}, emailAlertOptions = {}) => {
  return new Promise((resolve, reject) => {
    // Construct the airodump-ng command with customizable options
    let command = `airodump-ng ${target}`;

    if (testOptions.channel) {
      command += ` --channel ${testOptions.channel}`;
    }
    if (testOptions.interface) {
      command += ` --interface ${testOptions.interface}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error during wireless test: ${stderr}`);
      }

      // Parse the test results and extract network details
      const networks = parseWirelessTestResults(stdout);

      // Check for specific vulnerabilities (e.g., open networks or weak encryption)
      const vulnerableNetworks = networks.filter(network => network.SSID === '' || network.SSID.includes('OPEN'));

      if (vulnerableNetworks.length > 0 && emailAlertOptions.email) {
        const alertMessage = `Vulnerable networks detected:\n${JSON.stringify(vulnerableNetworks, null, 2)}`;
        sendAlert(emailAlertOptions.email, 'Wireless Network Vulnerabilities Detected', alertMessage)
          .then(() => console.log('Alert sent for vulnerable networks.'))
          .catch(err => console.error(`Error sending alert: ${err.message}`));
      }

      // Save the raw test results to a file
      const reportFilePath = saveWirelessTestReport(stdout, target, 'txt');

      // Save the parsed network details in JSON format
      const parsedReportFilePath = saveWirelessTestReport(JSON.stringify(networks, null, 2), target, 'json');

      resolve(`Wireless test for ${target} completed. Raw report saved at: ${reportFilePath}. Parsed report saved at: ${parsedReportFilePath}`);
    });
  });
};

// Function to monitor wireless network scan progress
const monitorWirelessScan = async (target, scanDuration) => {
  return new Promise((resolve, reject) => {
    let scanTime = 0;
    const interval = 5000; // Check progress every 5 seconds

    // Start the wireless scan
    const command = `airodump-ng ${target}`;
    const scanProcess = exec(command);

    scanProcess.stdout.on('data', (data) => {
      console.log(`Scan output: ${data}`);
    });

    // Monitor scan progress
    const progressInterval = setInterval(() => {
      scanTime += interval / 1000;
      console.log(`Wireless scan running for ${scanTime} seconds...`);

      if (scanTime >= scanDuration) {
        clearInterval(progressInterval);
        scanProcess.kill(); // Stop the scan after the specified duration
        resolve(`Wireless scan for ${target} completed after ${scanDuration} seconds.`);
      }
    }, interval);

    scanProcess.on('error', (error) => {
      clearInterval(progressInterval);
      reject(`Error during wireless scan: ${error.message}`);
    });
  });
};

// Function to perform wireless authentication tests (e.g., deauthentication)
const wirelessAuthTest = async (target, testOptions = {}) => {
  return new Promise((resolve, reject) => {
    // Example: Running deauthentication attack using aireplay-ng
    let command = `aireplay-ng --deauth 10 -a ${target}`;

    if (testOptions.interface) {
      command += ` --interface ${testOptions.interface}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error during wireless authentication test: ${stderr}`);
      }

      // Save the test results to a file
      const reportFilePath = saveWirelessTestReport(stdout, target, 'txt');

      resolve(`Wireless authentication test for ${target} completed. Report saved at: ${reportFilePath}`);
    });
  });
};

module.exports = { wirelessTest, monitorWirelessScan, wirelessAuthTest };
