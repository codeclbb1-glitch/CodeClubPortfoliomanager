const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const { verifyLimiter } = require('../middleware/rateLimiter');
const {
  createCertificate,
  getCertificates,
  verifyCertificate,
  revokeCertificate,
  downloadCertificatePDF,
  updateCertificate
} = require('../controllers/certificateController');

// Admin only routes
router.post('/', verifyAdmin, createCertificate);
router.get('/', verifyAdmin, getCertificates);
router.patch('/:certificateId', verifyAdmin, updateCertificate);
router.patch('/:certificateId/revoke', verifyAdmin, revokeCertificate);

// Public routes
router.get('/verify/:certificateId', verifyLimiter, verifyCertificate);
router.get('/:certificateId/pdf', downloadCertificatePDF);

module.exports = router;
