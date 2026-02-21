const express = require('express');
const {
  getBlogs,
  getBlog,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getRelatedBlogs,
  getTags,
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const { uploadBlogImage } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/tags', getTags);
router.get('/:slug', getBlog);
router.get('/:slug/related', getRelatedBlogs);

// Admin routes
router.get('/id/:id', protect, getBlogById);
router.post('/', protect, uploadBlogImage.single('thumbnail'), createBlog);
router.put('/:id', protect, uploadBlogImage.single('thumbnail'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
