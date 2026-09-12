const express = require('express');
const router = express.Router();
const {
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', getTeam);
router.post('/', verifyAdmin, createTeam);
router.put('/:id', verifyAdmin, updateTeam);
router.delete('/:id', verifyAdmin, deleteTeam);

module.exports = router;
