const express = require('express');
const router = express.Router();
const {
  getSocialLinks,
  getAllSocialLinks,
  upsertSocialLink,
  updateSocialLink,
  deleteSocialLink,
  seedSocialLinks,
} = require('../controllers/socialLinkController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getSocialLinks);

// Admin routes
router.get('/admin/all', protect, admin, getAllSocialLinks);
router.post('/', protect, admin, upsertSocialLink);
router.post('/seed', protect, admin, seedSocialLinks);
router.put('/:id', protect, admin, updateSocialLink);
router.delete('/:id', protect, admin, deleteSocialLink);

module.exports = router;
