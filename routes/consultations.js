const express = require('express');
const multer = require('multer');
const {
  createConsultation,
  getConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getConsultationStats,
} = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/auth');

// Use memory storage for Supabase upload
const storage = multer.memoryStorage();
const uploadNotice = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'), false);
    }
  },
});

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
