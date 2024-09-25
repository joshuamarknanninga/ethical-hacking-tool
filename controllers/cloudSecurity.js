const { exec } = require('child_process');
const { escape } = require('shell-escape'); // Sanitize input

const cloudSecurity = (target) => {
  return new Promise((resolve, reject) => {
    // Sanitize the target input to prevent command injection
    const safeTarget = escape([target]);

    // Example: Using ScoutSuite for cloud security assessment
    const command = `scout suite aws -b -u ${safeTarget}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

module.exports = cloudSecurity;
