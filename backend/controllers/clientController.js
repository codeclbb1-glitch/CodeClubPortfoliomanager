const Client = require('../models/Client');

// GET /api/clients
async function getClients(req, res) {
  try {
    const clients = await Client.find().sort({ order: 1 });
    res.json({ success: true, count: clients.length, clients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/clients (Admin only)
async function createClient(req, res) {
  try {
    const { name, title, businessName, logo, service, description, about, order } = req.body;
    const resolvedName = name || title || businessName;

    if (!resolvedName || !resolvedName.trim()) {
      return res.status(400).json({ success: false, message: 'Business Name / Title is required' });
    }

    const orderNum = Number(order) || 0;

    // Strict uniqueness check: If order > 0, make sure no other client has this same order number
    if (orderNum > 0) {
      const existingWithOrder = await Client.findOne({ order: orderNum });
      if (existingWithOrder) {
        return res.status(400).json({
          success: false,
          message: `Display order #${orderNum} is already assigned to "${existingWithOrder.name}". Please choose a different order number.`
        });
      }
    }

    const client = await Client.create({
      name: resolvedName.trim(),
      logo: (logo || '').trim(),
      service: (service || '').trim(),
      description: (description || about || '').trim(),
      about: (description || about || '').trim(),
      order: orderNum
    });

    res.status(201).json({ success: true, message: 'Client created successfully', client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/clients/:id (Admin only)
async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const { name, title, businessName, logo, service, description, about, order } = req.body;
    const resolvedName = name || title || businessName;

    if (!resolvedName || !resolvedName.trim()) {
      return res.status(400).json({ success: false, message: 'Business Name / Title is required' });
    }

    const orderNum = Number(order) || 0;

    // Strict uniqueness check: If order > 0, make sure no other client has this same order number
    if (orderNum > 0) {
      const existingWithOrder = await Client.findOne({ order: orderNum, _id: { $ne: id } });
      if (existingWithOrder) {
        return res.status(400).json({
          success: false,
          message: `Display order #${orderNum} is already assigned to "${existingWithOrder.name}". Please choose a different order number.`
        });
      }
    }

    const client = await Client.findByIdAndUpdate(
      id,
      {
        name: resolvedName.trim(),
        logo: (logo || '').trim(),
        service: (service || '').trim(),
        description: (description || about || '').trim(),
        about: (description || about || '').trim(),
        order: orderNum
      },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.json({ success: true, message: 'Client updated successfully', client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/clients/:id (Admin only)
async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient
};
