const express = require('express');
const router = express.Router();
const {
  getClients,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', getClients);
router.post('/', verifyAdmin, createClient);
router.put('/:id', verifyAdmin, updateClient);
router.delete('/:id', verifyAdmin, deleteClient);

module.exports = router;
