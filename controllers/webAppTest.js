const { exec } = require('child_process');

const webAppTest = (target) => {
  return new Promise((resolve, reject) => {
    // Example: Using OWASP ZAP for web application testing
    const command = `zap-cli quick-scan --start-options '-config api.key=12345' ${target}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

module.exports = webAppTest;
