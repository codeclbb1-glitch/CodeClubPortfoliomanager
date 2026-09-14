const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  instructorName: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  joiningDate: {
    type: Date,
    required: false
  },
  completionDate: {
    type: Date,
    required: false
  },
  progress: {
    type: String,
    required: false,
    trim: true
  },
  ceoReview: {
    type: String,
    required: false,
    trim: true
  },
  hash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Revoked'],
    default: 'Active'
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  revokedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
