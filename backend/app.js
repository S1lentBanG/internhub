const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const internshipRoutes = require('./routes/internships');
const applicationRoutes = require('./routes/applications');
const filterOptionRoutes = require('./routes/filterOptions');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/filter-options', filterOptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/', (req, res) => res.send('InternHub API running'));

module.exports = app;