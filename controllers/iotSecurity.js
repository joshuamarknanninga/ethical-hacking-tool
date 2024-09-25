const { exec } = require('child_process');
const { escape } = require('shell-escape'); // Sanitize input
require('dotenv').config(); // Load environment variables

const iotSecurity = (target) => {
  return new Promise((resolve, reject) => {
    // Sanitize the target input to prevent command injection
    const safeTarget = escape([target]);

    // Example: Using Shodan API for IoT device scanning
    const command = `shodan search "product:IoT device" ${safeTarget} --apikey ${process.env.SHODAN_API_KEY}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

module.exports = iotSecurity;
