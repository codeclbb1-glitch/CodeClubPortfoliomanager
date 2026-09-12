const Message = require('../models/Message');

// POST /api/messages or /api/contact (Public)
async function sendMessage(req, res) {
  try {
    const { name, email, phone, phoneNo, phone_no, companyNo, company_no, companyNumber, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const resolvedPhone = phone || phoneNo || phone_no || '';
    const resolvedCompanyNo = companyNo || company_no || companyNumber || '';

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: resolvedPhone.trim(),
      companyNo: resolvedCompanyNo.trim(),
      message: (message || '').trim()
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! Our team will get back to you shortly.',
      data: newMessage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/messages (Admin only)
async function getMessages(req, res) {
  try {
    const messages = await Message.find().sort({ created_at: -1 });
    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/messages/:id (Admin only)
async function getMessageById(req, res) {
  try {
    const { id } = req.params;
    const messageItem = await Message.findById(id);
    if (!messageItem) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Automatically mark unread as read when viewed
    if (messageItem.status === 'unread') {
      messageItem.status = 'read';
      await messageItem.save();
    }

    res.json({ success: true, message: messageItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/messages/:id (Admin only)
async function updateMessageStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const messageItem = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!messageItem) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: messageItem
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/messages/:id (Admin only)
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const messageItem = await Message.findByIdAndDelete(id);
    if (!messageItem) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  sendMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage
};
