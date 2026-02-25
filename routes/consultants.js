const express = require('express');
const {
  getConsultants,
  getAllConsultants,
  getConsultant,
  createConsultant,
  updateConsultant,
  deleteConsultant,
} = require('../controllers/consultantController');
const { protect, authorize } = require('../middleware/auth');
const { uploadConsultantImage } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', getConsultants);
router.get('/:id', getConsultant);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllConsultants);
router.post('/', protect, authorize('admin'), uploadConsultantImage.single('image'), createConsultant);
router.put('/:id', protect, authorize('admin'), uploadConsultantImage.single('image'), updateConsultant);
router.delete('/:id', protect, authorize('admin'), deleteConsultant);

module.exports = router;
