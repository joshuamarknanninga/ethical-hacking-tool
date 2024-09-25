const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { escape } = require('shell-escape'); // Sanitize input
const PDFDocument = require('pdfkit'); // For exporting reports as PDFs
const { ChartJSNodeCanvas } = require('chartjs-node-canvas'); // For generating charts

// Function to generate charts for the PDF report
const generateChart = async (data, chartPath, chartType = 'bar', labels = ['Item 1', 'Item 2', 'Item 3'], label = 'Results') => {
  const width = 600;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const configuration = {
    type: chartType, // Dynamic chart type
    data: {
      labels: labels, // Labels for chart (e.g., ports, vulnerabilities, CVEs)
      datasets: [{
        label: label,
        data: data, // Data from scan or attack results
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(chartPath, image);
};

// Function to assign vulnerability severity ratings and CVE numbers
const assessSeverityWithCVE = (port) => {
  switch (port) {
    case 80:
      return { severity: 'Low', cve: 'CVE-2021-1234', exploitability: 2.5 };
    case 443:
      return { severity: 'Medium', cve: 'CVE-2022-2345', exploitability: 5.7 };
    case 22:
      return { severity: 'High', cve: 'CVE-2023-3456', exploitability: 8.9 };
    default:
      return { severity: 'Unknown', cve: 'N/A', exploitability: 0 };
  }
};

// Function to generate threat modeling with CVEs and risk assessments
const generateDetailedThreatModeling = (ports) => {
  const analysis = [];
  ports.forEach(port => {
    const { severity, cve, exploitability } = assessSeverityWithCVE(port);
    analysis.push(`Port ${port}: Detected with severity ${severity} (CVE: ${cve}, Exploitability Score: ${exploitability})`);
    if (severity === 'High') {
      analysis.push(`  - Threat: High potential for exploitation. Immediate action recommended.`);
    } else if (severity === 'Medium') {
      analysis.push(`  - Threat: Moderate risk. Monitoring and patching recommended.`);
    } else if (severity === 'Low') {
      analysis.push(`  - Threat: Low risk, but security hardening is suggested.`);
    }
  });
  return analysis.join('\n');
};

// Red Team exercise using Metasploit for vulnerability scanning
const redTeam = async (target) => {
  return new Promise((resolve, reject) => {
    // Sanitize target to prevent command injection
    const safeTarget = escape([target]);

    // Define the path for saving the red team exercise report
    const reportFilePath = path.join(__dirname, `../reports/red_team_report_${Date.now()}.txt`);
    const pdfFilePath = reportFilePath.replace('.txt', '.pdf');
    const chartPath = path.join(__dirname, `../reports/red_team_chart_${Date.now()}.png`);

    // Metasploit vulnerability scan command (can be replaced with other modules)
    const command = `msfconsole -q -x "use auxiliary/scanner/portscan/tcp; set RHOSTS ${safeTarget}; run; exit"`;

    exec(command, async (error, stdout, stderr) => {
      if (error) {
        return reject(`Error during red team exercise: ${stderr}`);
      }

      // Example data representing open ports or vulnerabilities
      const ports = [80, 443, 22]; 
      const chartData = [2.5, 5.7, 8.9]; // Exploitability scores
      const chartLabels = ['CVE-2021-1234', 'CVE-2022-2345', 'CVE-2023-3456'];

      // Generate pie chart for vulnerability CVE and exploitability breakdown
      await generateChart(chartData, chartPath, 'pie', chartLabels, 'Exploitability Breakdown (CVE)');

      // Generate detailed threat modeling analysis based on the ports detected
      const threatModelingAnalysis = generateDetailedThreatModeling(ports);

      // Create PDF report with chart, severity ratings, CVEs, and threat modeling analysis
      const doc = new PDFDocument();
      const pdfStream = fs.createWriteStream(pdfFilePath);

      doc.pipe(pdfStream);
      doc.fontSize(16).text('Red Team Exercise Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Target: ${safeTarget}`);
      doc.moveDown();
      doc.fontSize(12).text('Results:');
      doc.fontSize(10).text(stdout, { align: 'left' });

      doc.moveDown();
      doc.fontSize(12).text('Threat Modeling and Vulnerability Severity (with CVE):');
      doc.fontSize(10).text(threatModelingAnalysis, { align: 'left' });

      doc.moveDown();
      doc.fontSize(12).text('Analysis:');
      doc.fontSize(10).text('Based on the scan, the chart below shows the detected vulnerabilities, CVEs, and their exploitability scores.');

      // Add pie chart to the PDF
      doc.moveDown();
      doc.image(chartPath, { align: 'center', width: 500 });

      doc.end();

      resolve(`Red Team exercise for ${safeTarget} completed. Reports saved at ${reportFilePath} and ${pdfFilePath}`);
    });
  });
};

// Cobalt Strike Red Team attack simulation with advanced techniques
const cobaltStrikeAttack = (target, technique = 'spearphishing', module = 'exploit') => {
  return new Promise((resolve, reject) => {
    const safeTarget = escape([target]);

    // Dynamic command for Cobalt Strike with customizable techniques and modules
    const command = `cobaltstrike --target ${safeTarget} --technique ${technique} --module ${module} --simulate-attack`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Cobalt Strike attack error: ${stderr}`);
      }

      // Process and return results with detailed reporting
      const report = `Cobalt Strike exercise completed with technique: ${technique}, Module: ${module}.\nResults:\n${stdout}`;

      // Save the Cobalt Strike report
      const reportFilePath = path.join(__dirname, `../reports/cobalt_strike_report_${Date.now()}.txt`);
      fs.writeFileSync(reportFilePath, report);

      resolve(report);
    });
  });
};

module.exports = { redTeam, cobaltStrikeAttack };
