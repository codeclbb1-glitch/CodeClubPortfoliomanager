const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const imageUploadRoutes = require('./routes/imageUploadRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const newsRoutes = require('./routes/newsRoutes');
const messageRoutes = require('./routes/messageRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://code-club-portfoliomanager-g5wu.vercel.app',
  'https://codeclub.tech',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files and static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '..', 'client', 'public', 'assets')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API routes (with /api prefix)
app.use('/api/admin', adminRoutes);
app.use('/api/admin', imageUploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/casestudies', projectRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', messageRoutes);
app.use('/api/team', teamRoutes);

// Fallback routes (without /api prefix) to prevent 404 Route Not Found
app.use('/admin', adminRoutes);
app.use('/admin', imageUploadRoutes);
app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/clients', clientRoutes);
app.use('/projects', projectRoutes);
app.use('/casestudies', projectRoutes);
app.use('/testimonials', testimonialRoutes);
app.use('/certificates', certificateRoutes);
app.use('/news', newsRoutes);
app.use('/messages', messageRoutes);
app.use('/contact', messageRoutes);
app.use('/team', teamRoutes);

app.get('/', (req, res) => {
  const mongoose = require('mongoose');
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    message: 'Job Portal API is running',
    database: isConnected ? 'Connected' : 'Disconnected',
    status: isConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (e.g. multer file errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Something went wrong' });
});

module.exports = app;
