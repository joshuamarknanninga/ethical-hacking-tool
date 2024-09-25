const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { escape } = require('shell-escape'); // Sanitize input

// Function to save audit results to a file
const saveAuditResults = (auditResults, target) => {
  const auditFilePath = path.join(__dirname, `../reports/security_audit_${target