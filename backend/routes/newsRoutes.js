const express = require('express');
const router = express.Router();
const {
  getNews,
  getSingleNews,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', getNews);
router.get('/:id', getSingleNews);
router.post('/', verifyAdmin, createNews);
router.put('/:id', verifyAdmin, updateNews);
router.delete('/:id', verifyAdmin, deleteNews);

module.exports = router;
