const { exec } = require('child_process');

const apiSecurity = (target) => {
  return new Promise((resolve, reject) => {
    // Example: Using OWASP ZAP for API testing
    const command = `zap-cli quick-scan --spider --api ${target}/api`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

module.exports = apiSecurity;
