const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { escape } = require('shell-escape'); // Sanitize input

// Function to save audit results to a file
const saveAuditResults = (auditResults, target) => {
  const auditFilePath = path.join(__dirname, `../reports/security_audit_${target}_${Date.now()}.txt`);
  fs.writeFileSync(auditFilePath, auditResults);
  return auditFilePath;
};

// Function to perform security audit using Lynis or other tools
const securityAudit = async (target) => {
  return new Promise((resolve, reject) => {
    // Sanitize target to prevent command injection
    const safeTarget = escape([target]);

    // Example command: Running a security audit using Lynis on the target system
    const command = `lynis audit system --tests-from-group security --tests-from-group networking --target ${safeTarget}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error during security audit: ${stderr}`);
      }

      // Save the audit results to a file
      const auditFilePath = saveAuditResults(stdout, safeTarget);
      
      // Return the success message with audit report location
      resolve(`Security Audit for ${safeTarget} completed. Results saved at: ${auditFilePath}`);
    });
  });
};

// Function to check specific services (e.g., SSH, Firewall, TLS configurations)
const checkServiceConfiguration = async (target, service) => {
  return new Promise((resolve, reject) => {
    const safeTarget = escape([target]);

    let command;
    switch (service.toLowerCase()) {
      case 'ssh':
        command = `lynis audit system --tests-from-group ssh --target ${safeTarget}`;
        break;
      case 'firewall':
        command = `lynis audit system --tests-from-group firewall --target ${safeTarget}`;
        break;
      case 'tls':
        command = `lynis audit system --tests-from-group tls --target ${safeTarget}`;
        break;
      default:
        return reject('Service not recognized. Please specify ssh, firewall, or tls.');
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error during ${service} configuration check: ${stderr}`);
      }

      // Save the service configuration audit results to a file
      const auditFilePath = saveAuditResults(stdout, `${safeTarget}_${service}`);
      
      resolve(`${service.toUpperCase()} configuration audit for ${safeTarget} completed. Results saved at: ${auditFilePath}`);
    });
  });
};

module.exports = { securityAudit, checkServiceConfiguration };
