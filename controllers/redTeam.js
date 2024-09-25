const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { escape } = require('shell-escape'); // Sanitize input
const PDFDocument = require('pdfkit'); // For exporting reports as PDFs
const { ChartJSNodeCanvas } = require('chart