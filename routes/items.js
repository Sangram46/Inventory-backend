const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getItems,
  getItem,
  getStats,
  createItem,
  updateItem,
  deleteItem,
  createValidation,
  updateValidation,
} = require('../controllers/itemController');

router.get('/stats', auth, getStats);
router.get('/', auth, getItems);
router.get('/:id', auth, getItem);
router.post('/', auth, createValidation, validate, createItem);
router.put('/:id', auth, updateValidation, validate, updateItem);
router.delete('/:id', auth, deleteItem);

module.exports = router;
