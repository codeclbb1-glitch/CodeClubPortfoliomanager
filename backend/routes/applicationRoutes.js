const express = require('express');
const router = express.Router();
const {
  createApplication, getAllApplications, getApplicationById, updateApplicationStatus
} = require('../controllers/applicationController');
const { verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public - candidate applies
router.post('/', upload.single('resume'), createApplication);

// Admin only
router.get('/', verifyAdmin, getAllApplications);
router.get('/:id', verifyAdmin, getApplicationById);
router.put('/:id/status', verifyAdmin, updateApplicationStatus);

module.exports = router;
