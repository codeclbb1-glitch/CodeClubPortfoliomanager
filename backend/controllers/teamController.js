const Team = require('../models/Team');

async function getTeam(req, res) {
  try {
    const team = await Team.find().sort({ order: 1 });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createTeam(req, res) {
  try {
    const { name, designation, experience, stack, photo, order } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const teamMember = await Team.create({
      name,
      designation,
      experience,
      stack,
      photo,
      order: Number(order) || 0
    });
    res.status(201).json({ success: true, message: 'Team member created successfully', teamMember });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateTeam(req, res) {
  try {
    const { id } = req.params;
    const { name, designation, experience, stack, photo, order } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const teamMember = await Team.findByIdAndUpdate(
      id,
      { name, designation, experience, stack, photo, order: Number(order) || 0 },
      { new: true, runValidators: true }
    );
    if (!teamMember) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, message: 'Team member updated successfully', teamMember });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteTeam(req, res) {
  try {
    const { id } = req.params;
    const teamMember = await Team.findByIdAndDelete(id);
    if (!teamMember) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam
};
