const Job = require('../models/Job');

// GET /api/jobs?search=&location=&job_type=&page=&limit=
async function getAllJobs(req, res) {
  try {
    const { search = '', location = '', job_type = '', page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { status: 'active' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (job_type) {
      filter.job_type = job_type;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ created_at: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(filter)
    ]);

    res.json({
      success: true,
      jobs,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching jobs' });
  }
}

// GET /api/jobs/:id
async function getJobById(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching job' });
  }
}

// Apply for a job (public route)
async function applyForJob(req, res) {
  try {
    const { jobId } = req.params;
    const { name, email, phone, cover_letter, resume } = req.body;

    if (!jobId || !name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Create application
    const application = {
      name,
      email,
      phone,
      cover_letter,
      resume,
      job_title: job.title
    };

    // Add application to job's applications array
    job.applications.push(application);
    await job.save();

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error applying for job' });
  }
}

// POST /api/jobs  (admin only)
async function createJob(req, res) {
  try {
    const { title, company, location, salary, job_type, description, requirements, skills, deadline } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ success: false, message: 'Title, company, location, and description are required' });
    }

    const job = await Job.create({
      title, company, location, salary, job_type, description, requirements, skills, deadline
    });

    res.status(201).json({ success: true, message: 'Job created successfully', jobId: job._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error creating job' });
  }
}

// PUT /api/jobs/:id  (admin only)
async function updateJob(req, res) {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, message: 'Job updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating job' });
  }
}

// DELETE /api/jobs/:id  (admin only)
async function deleteJob(req, res) {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error deleting job' });
  }
}

// GET /api/jobs/admin/all  (admin only - includes closed jobs, supports filtering)
async function getAllJobsAdmin(req, res) {
  try {
    const { search = '', status = '' } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter).sort({ created_at: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching jobs' });
  }
}

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob, getAllJobsAdmin, applyForJob };
