const express = require('express');
const router = express.Router();
const { getAllNotifications, createNotification } = require('../controllers/notificationController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyAdmin, getAllNotifications);
router.post('/', verifyAdmin, createNotification);

module.exports = router;
