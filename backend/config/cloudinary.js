const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
require('dotenv').config();


// Configure Cloudinary SDK
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Check if Cloudinary is configured via environment variables
 */
function isCloudinaryConfigured() {
  if (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.trim() !== '') {
    return true;
  }
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME.trim() !== '' &&
    process.env.CLOUDINARY_API_KEY.trim() !== '' &&
    process.env.CLOUDINARY_API_SECRET.trim() !== ''
  );
}

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} - Cloudinary upload result containing secure_url, public_id, etc.
 */
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Helper to upload resume (PDF / document) to Cloudinary
 */
async function uploadResume(buffer, filename) {
  const publicId = `resume_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
  return uploadBufferToCloudinary(buffer, {
    folder: 'job_portal/resumes',
    public_id: publicId,
    resource_type: 'auto'
  });
}

/**
 * Helper to upload images to Cloudinary
 */
async function uploadImage(buffer, filename) {
  const publicId = `img_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
  return uploadBufferToCloudinary(buffer, {
    folder: 'job_portal/images',
    public_id: publicId,
    resource_type: 'image'
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  uploadResume,
  uploadImage
};
