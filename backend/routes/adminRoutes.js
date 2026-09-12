const express = require('express');
const router = express.Router();
const { login, setup, dashboard } = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/setup', setup);
router.get('/dashboard', verifyAdmin, dashboard);

module.exports = router;
