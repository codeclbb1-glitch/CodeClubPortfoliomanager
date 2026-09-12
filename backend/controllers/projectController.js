const Project = require('../models/Project');

// GET /api/projects or /api/casestudies
async function getProjects(req, res) {
  try {
    const projects = await Project.find().sort({ order: 1, created_at: -1 });
    res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/projects (Admin only)
async function createProject(req, res) {
  try {
    const { title, projectType, description, image, tags, techStack, link, liveLink, order } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim()) {
      parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (typeof techStack === 'string' && techStack.trim()) {
      parsedTags = techStack.split(',').map(t => t.trim()).filter(Boolean);
    }

    const resolvedTechStack = parsedTags.join(', ');
    const resolvedLink = (link || liveLink || '').trim();

    const project = await Project.create({
      title: title.trim(),
      projectType: (projectType || '').trim(),
      description: (description || '').trim(),
      image: (image || '').trim(),
      tags: parsedTags,
      techStack: resolvedTechStack,
      link: resolvedLink,
      liveLink: resolvedLink,
      order: Number(order) || 0
    });

    res.status(201).json({ success: true, message: 'Case study / project created successfully', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/projects/:id (Admin only)
async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { title, projectType, description, image, tags, techStack, link, liveLink, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim()) {
      parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (typeof techStack === 'string' && techStack.trim()) {
      parsedTags = techStack.split(',').map(t => t.trim()).filter(Boolean);
    }

    const resolvedTechStack = parsedTags.join(', ');
    const resolvedLink = (link || liveLink || '').trim();

    const project = await Project.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        projectType: (projectType || '').trim(),
        description: (description || '').trim(),
        image: (image || '').trim(),
        tags: parsedTags,
        techStack: resolvedTechStack,
        link: resolvedLink,
        liveLink: resolvedLink,
        order: Number(order) || 0
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Case study / project not found' });
    }

    res.json({ success: true, message: 'Case study / project updated successfully', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/projects/:id (Admin only)
async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Case study / project not found' });
    }
    res.json({ success: true, message: 'Case study / project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};
