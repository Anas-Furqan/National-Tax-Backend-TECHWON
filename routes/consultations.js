const express = require('express');
const {
  createConsultation,
  getConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getConsultationStats,
} = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/auth');
const { uploadNotice } = require('../config/cloudinary');

const router = express.Router();

// Public route - create consultation
router.post('/', uploadNotice.single('noticeFile'), createConsultation);

// Admin routes
router.get('/', protect, getConsultations);
router.get('/stats', protect, getConsultationStats);
router.get('/:id', protect, getConsultation);
router.put('/:id', protect, updateConsultation);
router.delete('/:id', protect, authorize('admin'), deleteConsultation);

module.exports = router;
