const emailjs = require('emailjs');
require('dotenv').config();

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
  console.warn('EmailJS credentials are missing. Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY in .env');
}

const emailServer = emailjs.serverConnect({
  user: EMAILJS_PUBLIC_KEY,
  password: EMAILJS_PRIVATE_KEY
});

async function sendApplicationStatusEmail(toEmail, applicantName, jobTitle, status) {
  const subject =
    status === 'Accepted'
      ? `Congratulations! Your application for ${jobTitle}`
      : `Update on your application for ${jobTitle}`;

  const message =
    status === 'Accepted'
      ? `Dear ${applicantName},\n\nGreat news! Your application for the position of "${jobTitle}" has been ACCEPTED. Our team will contact you shortly with the next steps.\n\nBest regards,\nHiring Team`
      : `Dear ${applicantName},\n\nThank you for applying for the position of "${jobTitle}". After careful review, we have decided not to move forward with your application at this time.\n\nWe wish you the best in your job search.\n\nBest regards,\nHiring Team`;

  try {
    await emailServer.send({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      template_params: {
        to_email: toEmail,
        subject,
        message
      }
    });
    console.log(`Email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('Email sending failed:', err.message);
    return false;
  }
}

async function sendDailyDigestEmail({ date, messages, applications }) {
  const hasMessages = messages.length > 0;
  const hasApplications = applications.length > 0;

  if (!hasMessages && !hasApplications) {
    return false;
  }

  const messageRows = messages
    .map(
      (msg, idx) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(msg.name)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(msg.email)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(msg.phone || '')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(msg.message || '')}</td>
      </tr>
    `
    )
    .join('');

  const applicationRows = applications
    .map(
      (app, idx) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(app.name)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(app.email)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(app.job_id?.title || 'N/A')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(app.job_id?.company || 'N/A')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(app.skills || '')}</td>
      </tr>
    `
    )
    .join('');

  const messagesSection = hasMessages ? `
    <h2 style="color: #001c3d; margin-top: 24px;">Messages (${messages.length})</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">#</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Name</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Email</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Phone</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Message</th>
        </tr>
      </thead>
      <tbody>${messageRows}</tbody>
    </table>
  ` : '';

  const applicationsSection = hasApplications ? `
    <h2 style="color: #001c3d; margin-top: 24px;">Applications (${applications.length})</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">#</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Name</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Email</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Job Title</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Company</th>
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Skills</th>
        </tr>
      </thead>
      <tbody>${applicationRows}</tbody>
    </table>
  ` : '';

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; max-width: 900px; margin: 0 auto;">
      <h1 style="color: #001c3d;">Daily Digest - ${date}</h1>
      <p style="color: #6b7280; font-size: 14px;">
        ${hasMessages ? `${messages.length} message${messages.length > 1 ? 's' : ''}` : ''}
        ${hasMessages && hasApplications ? ' and ' : ''}
        ${hasApplications ? `${applications.length} application${applications.length > 1 ? 's' : ''}` : ''}
        received today.
      </p>
      ${messagesSection}
      ${applicationsSection}
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        Sent automatically by Code Club Portfolio Manager.
      </p>
    </div>
  `;

  try {
    await emailServer.send({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      template_params: {
        to_email: process.env.DIGEST_EMAIL_TO || process.env.EMAIL_USER,
        subject: `Daily Digest - ${date} | ${messages.length} Messages, ${applications.length} Applications`,
        message: html,
        date,
        message_count: messages.length,
        application_count: applications.length
      }
    });
    return true;
  } catch (err) {
    console.error('Daily digest email failed:', err.message);
    return false;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

module.exports = {
  sendApplicationStatusEmail,
  sendDailyDigestEmail
};
