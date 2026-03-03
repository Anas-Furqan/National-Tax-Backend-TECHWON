const express = require('express');
const router = express.Router();
const {
  getNews,
  getAllNews,
  getSingleNews,
  createNews,
  updateNews,
  deleteNews,
  uploadPdf,
} = require('../controllers/newsController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getNews);
router.get('/:id', getSingleNews);

// Admin routes
router.get('/admin/all', protect, admin, getAllNews);
router.post('/', protect, admin, uploadPdf.single('pdf'), createNews);
router.put('/:id', protect, admin, uploadPdf.single('pdf'), updateNews);
router.delete('/:id', protect, admin, deleteNews);

module.exports = router;
