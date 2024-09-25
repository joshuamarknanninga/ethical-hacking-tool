const { exec } = require('child_process');
const { escape } = require('shell-escape'); // Use shell-escape for sanitizing input

const penetrationTest = (target) => {
  return new Promise((resolve, reject) => {
    // Sanitize the target input to prevent command injection
    const safeTarget = escape([target]);

    // Example: Using nmap for basic penetration testing
    const command = `nmap -sV -Pn ${safeTarget}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

module.exports = penetrationTest;
