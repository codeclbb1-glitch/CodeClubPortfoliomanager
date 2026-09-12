const nodemailer = require('nodemailer');
require('dotenv').config();

// Uses Gmail SMTP by default. See .env.example for setup instructions.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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
    await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text: message
    });
    console.log(`Email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('Email sending failed:', err.message);
    return false;
  }
}

module.exports = { sendApplicationStatusEmail };
