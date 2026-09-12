const Notification = require('../models/Notification');

// GET /api/notifications  (admin only)
async function getAllNotifications(req, res) {
  try {
    const notifications = await Notification.find()
      .populate('application_id', 'name email')
      .sort({ created_at: -1 });

    const formatted = notifications.map((n) => {
      const obj = n.toJSON();
      obj.applicant_name = n.application_id?.name;
      obj.applicant_email = n.application_id?.email;
      obj.application_id = n.application_id?._id;
      return obj;
    });

    res.json({ success: true, notifications: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
}

// POST /api/notifications  (admin only - manual notification)
async function createNotification(req, res) {
  try {
    const { application_id, message } = req.body;
    if (!application_id || !message) {
      return res.status(400).json({ success: false, message: 'application_id and message are required' });
    }
    const notification = await Notification.create({ application_id, message, status: 'sent' });
    res.status(201).json({ success: true, message: 'Notification created', notificationId: notification._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error creating notification' });
  }
}

module.exports = { getAllNotifications, createNotification };
