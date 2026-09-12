const crypto = require('crypto');

/**
 * Calculates the HMAC-SHA256 hash of certificate data.
 * @param {Object} certificate
 * @param {string} certificate.certificateId
 * @param {string} certificate.studentName
 * @param {string} certificate.courseName
 * @param {string} certificate.instructorName
 * @param {Date|string} certificate.issueDate
 * @returns {string} HMAC hex digest
 */
const calculateHash = (certificate) => {
  const { certificateId, studentName, courseName, instructorName, issueDate } = certificate;
  
  // Ensure standard ISO date string representation
  const dateObj = new Date(issueDate);
  const dateString = dateObj.toISOString();
  
  // Concatenate parameters
  const dataString = certificateId + studentName + courseName + instructorName + dateString;
  
  // Create HMAC-SHA256 hash using the server-side HASH_SECRET
  const hashSecret = process.env.HASH_SECRET || 'fallback_secret_for_development_purposes_only';
  const hmac = crypto.createHmac('sha256', hashSecret);
  hmac.update(dataString);
  return hmac.digest('hex');
};

module.exports = {
  calculateHash
};
