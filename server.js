const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./utils/database');
const apiRoutes = require('./routes/api');
const path = require('path');
const helmet = require('helmet'); // Security
const cors = require('cors');     // Cross-Origin Resource Sharing
const morgan = require('morgan'); // Logging
require('dotenv').config();       // Environment Variables

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(helmet()); // Add security headers
app.use(cors());   // Enable CORS
app.use(morgan('dev')); // Log requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', apiRoutes);

// Render Home Page
app.get('/', (req, res) => {
  res.render('index');
});

// Render Reports Page
app.get('/reports', async (req, res) => {
  const Report = require('./models/Report');
  const reports = await Report.find().sort({ date: -1 });
  res.render('reports', { reports });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
