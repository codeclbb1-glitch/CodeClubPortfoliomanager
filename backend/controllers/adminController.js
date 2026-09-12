const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Job = require('../models/Job');
const Application = require('../models/Application');
const News = require('../models/News');
const Certificate = require('../models/Certificate');

const JWT_SECRET = process.env.JWT_SECRET || 'job_portal_super_secret_jwt_key_2026';

// POST /api/admin/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    let admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid password (case sensitive)' });
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
  }
}

// GET /api/admin/setup
async function setup(req, res) {
  try {
    const email = 'codeclub@codeclub.tech';
    const password = 'CodeClub3322';
    let admin = await Admin.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = await Admin.create({ name: 'Code Club Admin', email, password: hashedPassword });
    }
    res.json({
      success: true,
      message: 'Database setup and admin check completed successfully',
      adminExists: true,
      email: admin.email
    });
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ success: false, message: 'Setup error: ' + err.message });
  }
}

// GET /api/admin/dashboard
async function dashboard(req, res) {
  try {
    const [totalJobs, activeJobs, totalApplications, pending, accepted, rejected, totalNews, totalCertificates, activeCertificates, revokedCertificates] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Pending' }),
      Application.countDocuments({ status: 'Accepted' }),
      Application.countDocuments({ status: 'Rejected' }),
      News.countDocuments(),
      Certificate.countDocuments(),
      Certificate.countDocuments({ status: 'Active' }),
      Certificate.countDocuments({ status: 'Revoked' })
    ]);

    res.json({
      success: true,
      stats: { totalJobs, activeJobs, totalApplications, pending, accepted, rejected, totalNews, totalCertificates, activeCertificates, revokedCertificates }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
}

module.exports = { login, setup, dashboard };
