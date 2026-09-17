const mongoose = require('mongoose');
const Message = require('../models/Message');
const Application = require('../models/Application');
const { sendDailyDigestEmail } = require('../utils/emailService');
require('dotenv').config();

async function getDailyDigest() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  
  const [messages, applications] = await Promise.all([
    Message.find({
      created_at: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).sort({ created_at: -1 }),
    
    Application.find({
      applied_at: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    })
      .populate('job_id', 'title company')
      .sort({ applied_at: -1 })
  ]);
  
  await mongoose.disconnect();
  
  return {
    date: startOfDay.toISOString().split('T')[0],
    messages,
    applications
  };
}

async function sendDailyDigest() {
  try {
    const digest = await getDailyDigest();
    const { messages, applications, date } = digest;
    
    const hasMessages = messages.length > 0;
    const hasApplications = applications.length > 0;
    
    if (!hasMessages && !hasApplications) {
      return;
    }
    
    await sendDailyDigestEmail({
      date,
      messages,
      applications
    });
    
  } catch (error) {
    console.error('Error sending daily digest:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  sendDailyDigest();
}

module.exports = { sendDailyDigest, getDailyDigest };
