const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createValidation,
  updateValidation,
} = require('../controllers/categoryController');

router.get('/', auth, getCategories);
router.post('/', auth, createValidation, validate, createCategory);
router.put('/:id', auth, updateValidation, validate, updateCategory);
router.delete('/:id', auth, deleteCategory);

module.exports = router;
