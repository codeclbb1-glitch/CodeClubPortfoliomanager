const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', getProjects);
router.post('/', verifyAdmin, createProject);
router.put('/:id', verifyAdmin, updateProject);
router.delete('/:id', verifyAdmin, deleteProject);

module.exports = router;
