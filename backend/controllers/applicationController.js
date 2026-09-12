const mongoose = require('mongoose');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const { sendApplicationStatusEmail } = require('../utils/emailService');
const { isCloudinaryConfigured, uploadResume } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');
const os = require('os');

function getSafeUploadDir(subfolder) {
  let uploadDir = path.join(__dirname, '..', 'uploads', subfolder);
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  } catch (err) {
    uploadDir = path.join(os.tmpdir(), 'uploads', subfolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }
}

// POST /api/applications  (public - candidate applies)
async function createApplication(req, res) {
  try {
    const { job_id, name, email, phone, address, education, experience, skills, linkedin, github, cover_letter } = req.body;

    if (!job_id || !name || !email || !phone || !linkedin) {
      return res.status(400).json({ success: false, message: 'job_id, name, email, phone, and linkedin are required' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email address format' });
    }

    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/.+$/i;
    if (!linkedinRegex.test(linkedin.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)' });
    }

    if (github && github.trim()) {
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/.+$/i;
      if (!githubRegex.test(github.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid GitHub profile URL (e.g. https://github.com/username)' });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(job_id)) {
      return res.status(400).json({ success: false, message: 'Invalid job_id' });
    }

    // Verify that the job is available
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    }
    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ success: false, message: 'The application deadline for this job has passed' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume (PDF) is required' });
    }

    let resumePath = '';

    // Upload to Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await uploadResume(req.file.buffer, req.file.originalname);
        resumePath = uploadResult.secure_url || uploadResult.url;
      } catch (cloudErr) {
        console.error('Cloudinary upload error, falling back to local storage:', cloudErr.message);
        const uploadDir = getSafeUploadDir('resumes');
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `resume-${unique}${path.extname(req.file.originalname || '.pdf')}`;
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        resumePath = `/uploads/resumes/${filename}`;
      }
    } else {
      // Local storage fallback
      const uploadDir = getSafeUploadDir('resumes');
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `resume-${unique}${path.extname(req.file.originalname || '.pdf')}`;
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      resumePath = `/uploads/resumes/${filename}`;
    }

    const application = await Application.create({
      job_id, name, email, phone, address, education, experience, skills,
      linkedin: linkedin ? linkedin.trim() : undefined,
      github: github ? github.trim() : undefined,
      resume: resumePath, cover_letter
    });

    res.status(201).json({ success: true, message: 'Application submitted successfully', applicationId: application._id, resume: resumePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error submitting application' });
  }
}


// GET /api/applications  (admin only) ?job_id=&status=&search=&date=
async function getAllApplications(req, res) {
  try {
    const { job_id, status, search = '', date = '' } = req.query;
    const filter = {};
    if (job_id) filter.job_id = job_id;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.applied_at = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const applications = await Application.find(filter)
      .populate('job_id', 'title company')
      .sort({ applied_at: -1 });

    // Flatten job title/company onto each application to match old response shape
    const formatted = applications.map((app) => {
      const obj = app.toJSON();
      obj.job_title = app.job_id?.title;
      obj.job_company = app.job_id?.company;
      obj.job_id = app.job_id?._id;
      return obj;
    });

    res.json({ success: true, applications: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
}

// GET /api/applications/:id  (admin only)
async function getApplicationById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const app = await Application.findById(req.params.id).populate('job_id', 'title company');
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    const obj = app.toJSON();
    obj.job_title = app.job_id?.title;
    obj.job_company = app.job_id?.company;
    obj.job_id = app.job_id?._id;

    res.json({ success: true, application: obj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching application' });
  }
}

// PUT /api/applications/:id/status  (admin only) body: { status: 'Accepted' | 'Rejected' }
async function updateApplicationStatus(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const { status } = req.body;
    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Pending, Accepted, or Rejected' });
    }

    const application = await Application.findById(req.params.id).populate('job_id', 'title');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Restrict re-evaluation of finalized applications
    if (application.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'This application has already been processed and finalized.' });
    }

    application.status = status;
    await application.save();

    const jobTitle = application.job_id?.title || 'the position';
    const message = `Your application for "${jobTitle}" was ${status.toLowerCase()}.`;
    await Notification.create({ application_id: application._id, message, status: 'sent' });

    // Fire-and-forget email (doesn't block the response if email fails)
    sendApplicationStatusEmail(application.email, application.name, jobTitle, status);

    res.json({ success: true, message: `Application ${status.toLowerCase()} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating application status' });
  }
}

module.exports = { createApplication, getAllApplications, getApplicationById, updateApplicationStatus };
