const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./utils/database');
const apiRoutes = require('./routes/api');
const path = require('path');

const app = express();

// Connect to Database
connectDB();

// Middleware
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

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
