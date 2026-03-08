const express = require('express');
const {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.get('/admin/all', protect, getAllCategories);
router.post('/', protect, authorize('admin'), createCategory);
router.post('/seed', protect, authorize('admin'), seedCategories);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
