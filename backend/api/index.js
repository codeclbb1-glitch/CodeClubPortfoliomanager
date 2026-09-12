const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (dbErr) {
    console.error('Serverless DB Error:', dbErr.message);
    if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
      return res.status(503).json({
        success: false,
        message: 'Job Portal API serverless function is running, but database connection failed.',
        error: dbErr.message,
        tip: 'Please configure MONGODB_URI in your Vercel Project Settings (Settings -> Environment Variables) and make sure MongoDB Atlas Network Access is set to allow 0.0.0.0/0 (Anywhere).'
      });
    }
  }

  return app(req, res);
};
