const { exec } = require('child_process');
const { escape } = require('shell-escape'); // Sanitize input

const penetrationTest = (target) => {
  return new Promise((resolve, reject) => {
    // Sanitize the target input to prevent command injection
    const safeTarget = escape([target]);

    // Example: Using nmap for basic penetration testing
    const command = `nmap -sV -Pn ${safeTarget}`;

    exec(command, (err