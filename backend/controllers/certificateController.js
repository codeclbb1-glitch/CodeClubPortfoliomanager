const QRCode = require('qrcode');
const Certificate = require('../models/Certificate');
const { calculateHash } = require('../utils/cryptoUtils');
const { generateCertificatePDF } = require('../utils/pdfGenerator');

// POST /api/certificates
// @desc    Create a new certificate (Admin only)
// @access  Private (Admin)
async function createCertificate(req, res) {
  const { studentName, courseName, instructorName, issueDate } = req.body;

  if (!studentName || !courseName || !instructorName) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields (studentName, courseName, instructorName).' });
  }

  try {
    const certDate = issueDate ? new Date(issueDate) : new Date();

    // 1. Generate unique Certificate ID (format: CC-YYYY-XXXXXX)
    let certificateId;
    let isUnique = false;
    const year = certDate.getFullYear();

    while (!isUnique) {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      certificateId = `CC-${year}-${randomPart}`;
      
      const existing = await Certificate.findOne({ certificateId });
      if (!existing) {
        isUnique = true;
      }
    }

    // Payload for hash calculation
    const certPayload = {
      certificateId,
      studentName,
      courseName,
      instructorName,
      issueDate: certDate
    };

    // 2. Generate HMAC-SHA256 Integrity Hash
    const hash = calculateHash(certPayload);

    // 3. Save Certificate in Database (issuedBy linked to authenticated Admin ID)
    const newCertificate = new Certificate({
      ...certPayload,
      hash,
      issuedBy: req.admin.id
    });

    await newCertificate.save();

    // 4. Generate QR code pointing to /verify/:certificateId
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 250,
      margin: 1
    });

    res.status(201).json({
      success: true,
      certificate: newCertificate,
      qrCode: qrCodeDataUrl,
      verifyUrl
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ success: false, message: 'Server error creating certificate' });
  }
}

// GET /api/certificates
// @desc    Get all certificates with pagination and search (Admin only)
// @access  Private (Admin)
async function getCertificates(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
        { certificateId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Certificate.countDocuments(query);
    const certificates = await Certificate.find(query)
      .populate('issuedBy', 'email name')
      .populate('revokedBy', 'email name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      certificates,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, message: 'Server error fetching certificates' });
  }
}

// GET /api/certificates/verify/:certificateId
// @desc    Verify a certificate by ID (Public with Rate Limit)
// @access  Public
async function verifyCertificate(req, res) {
  const { certificateId } = req.params;

  try {
    const certificate = await Certificate.findOne({ certificateId })
      .populate('issuedBy', 'email name')
      .populate('revokedBy', 'email name');

    if (!certificate) {
      return res.status(200).json({
        success: true,
        verified: false,
        message: 'Certificate not found in registry database.',
        reason: 'NOT_FOUND'
      });
    }

    // Recalculate signature to check database tampering
    const recalculatedHash = calculateHash({
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      issueDate: certificate.issueDate
    });

    if (recalculatedHash !== certificate.hash) {
      return res.status(200).json({
        success: true,
        verified: false,
        message: 'Security mismatch: Cryptographic signature validation failed. Data may have been tampered with.',
        reason: 'TAMPERED',
        certificate: {
          certificateId: certificate.certificateId,
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          instructorName: certificate.instructorName,
          issueDate: certificate.issueDate,
          status: 'Invalid'
        }
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      status: certificate.status,
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        issueDate: certificate.issueDate,
        status: certificate.status,
        issuedBy: certificate.issuedBy ? certificate.issuedBy.email : 'System Admin',
        revokedBy: certificate.revokedBy ? certificate.revokedBy.email : null,
        revokedAt: certificate.revokedAt
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ success: false, message: 'Server error verifying certificate' });
  }
}

// PATCH /api/certificates/:certificateId/revoke
// @desc    Revoke a certificate (Admin only)
// @access  Private (Admin)
async function revokeCertificate(req, res) {
  const { certificateId } = req.params;

  try {
    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    if (certificate.status === 'Revoked') {
      return res.status(400).json({ success: false, message: 'Certificate is already revoked.' });
    }

    certificate.status = 'Revoked';
    certificate.revokedBy = req.admin.id;
    certificate.revokedAt = new Date();

    await certificate.save();

    const updatedCert = await Certificate.findById(certificate._id)
      .populate('issuedBy', 'email name')
      .populate('revokedBy', 'email name');

    res.status(200).json({
      success: true,
      message: 'Certificate successfully revoked.',
      certificate: updatedCert
    });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    res.status(500).json({ success: false, message: 'Server error revoking certificate' });
  }
}

// GET /api/certificates/:certificateId/pdf
// @desc    Generate and download PDF certificate (Public)
// @access  Public
async function downloadCertificatePDF(req, res) {
  const { certificateId } = req.params;

  try {
    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    // Recalculate signature to check database tampering
    const recalculatedHash = calculateHash({
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      issueDate: certificate.issueDate
    });

    if (recalculatedHash !== certificate.hash) {
      return res.status(400).json({ success: false, message: 'Cannot generate PDF for a tampered certificate.' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify/${certificateId}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CodeClub_${certificateId}.pdf"`);

    const pdfBuffer = await generateCertificatePDF(certificate, verifyUrl);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error generating PDF' });
    }
  }
}

module.exports = {
  createCertificate,
  getCertificates,
  verifyCertificate,
  revokeCertificate,
  downloadCertificatePDF
};
