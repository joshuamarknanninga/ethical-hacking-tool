const { exec } = require('child_process');
const { escape } = require('shell-escape'); // Sanitize input

const apiSecurity = (target) => {
  return new Promise((resolve, reject) => {
    // Sanitize the target input to prevent command injection
    const safeTarget = escape([target]);

    // Example: Using OWASP ZAP for API testing
    const command = `zap-cli quick-scan --spider --api ${safeTarget}/api`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

module.exports = apiSecurity;
