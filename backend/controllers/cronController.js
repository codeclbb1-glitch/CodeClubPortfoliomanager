const mongoose = require('mongoose');
const Message = require('../models/Message');
const Application = require('../models/Application');
const { sendDailyDigestEmail } = require('../utils/emailService');
require('dotenv').config();

async function runDailyDigest(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && req.query.secret !== cronSecret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const [messages, applications] = await Promise.all([
      Message.find({
        created_at: { $gte: startOfDay, $lt: endOfDay }
      }).sort({ created_at: -1 }),
      Application.find({
        applied_at: { $gte: startOfDay, $lt: endOfDay }
      })
        .populate('job_id', 'title company')
        .sort({ applied_at: -1 })
    ]);

    const hasMessages = messages.length > 0;
    const hasApplications = applications.length > 0;

    if (!hasMessages && !hasApplications) {
      return res.status(200).json({
        success: true,
        message: 'No messages or applications today. No email sent.',
        date: startOfDay.toISOString().split('T')[0],
        messages: 0,
        applications: 0
      });
    }

    await sendDailyDigestEmail({
      date: startOfDay.toISOString().split('T')[0],
      messages,
      applications
    });

    res.status(200).json({
      success: true,
      message: 'Daily digest email sent successfully',
      date: startOfDay.toISOString().split('T')[0],
      messages: messages.length,
      applications: applications.length
    });
  } catch (error) {
    console.error('Cron daily digest error:', error);
    res.status(500).json({ success: false, message: 'Failed to send daily digest', error: error.message });
  }
}

module.exports = { runDailyDigest };
