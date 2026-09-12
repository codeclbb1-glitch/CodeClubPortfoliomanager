const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage
} = require('../controllers/messageController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public route to submit message / inquiry
router.post('/', sendMessage);

// Admin protected routes
router.get('/', verifyAdmin, getMessages);
router.get('/:id', verifyAdmin, getMessageById);
router.put('/:id', verifyAdmin, updateMessageStatus);
router.delete('/:id', verifyAdmin, deleteMessage);

module.exports = router;
