const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', getTestimonials);
router.post('/', verifyAdmin, createTestimonial);
router.put('/:id', verifyAdmin, updateTestimonial);
router.delete('/:id', verifyAdmin, deleteTestimonial);

module.exports = router;
