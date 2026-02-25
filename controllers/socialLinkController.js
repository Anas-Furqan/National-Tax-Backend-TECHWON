const SocialLink = require('../models/SocialLink');

// @desc    Get all social links (public)
// @route   GET /api/social-links
// @access  Public
exports.getSocialLinks = async (req, res, next) => {
  try {
    const socialLinks = await SocialLink.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({
      success: true,
      data: socialLinks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all social links including inactive (admin)
// @route   GET /api/social-links/admin/all
// @access  Private/Admin
exports.getAllSocialLinks = async (req, res, next) => {
  try {
    const socialLinks = await SocialLink.find().sort({ order: 1 });
    res.status(200).json({
      success: true,
      data: socialLinks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update social link
// @route   POST /api/social-links
// @access  Private/Admin
exports.upsertSocialLink = async (req, res, next) => {
  try {
    const { platform, url, isActive, order } = req.body;

    // Try to find existing link for this platform
    let socialLink = await SocialLink.findOne({ platform });

    if (socialLink) {
      // Update existing
      socialLink.url = url;
      socialLink.isActive = isActive !== undefined ? isActive : socialLink.isActive;
      socialLink.order = order !== undefined ? order : socialLink.order;
      await socialLink.save();
    } else {
      // Create new
      socialLink = await SocialLink.create({
        platform,
        url,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      });
    }

    res.status(200).json({
      success: true,
      data: socialLink,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update social link
// @route   PUT /api/social-links/:id
// @access  Private/Admin
exports.updateSocialLink = async (req, res, next) => {
  try {
    const { url, isActive, order } = req.body;

    const socialLink = await SocialLink.findByIdAndUpdate(
      req.params.id,
      { url, isActive, order },
      { new: true, runValidators: true }
    );

    if (!socialLink) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found',
      });
    }

    res.status(200).json({
      success: true,
      data: socialLink,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete social link
// @route   DELETE /api/social-links/:id
// @access  Private/Admin
exports.deleteSocialLink = async (req, res, next) => {
  try {
    const socialLink = await SocialLink.findByIdAndDelete(req.params.id);

    if (!socialLink) {
      return res.status(404).json({
        success: false,
        message: 'Social link not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Social link deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed default social links
// @route   POST /api/social-links/seed
// @access  Private/Admin
exports.seedSocialLinks = async (req, res, next) => {
  try {
    const defaultLinks = [
      { platform: 'facebook', url: 'https://facebook.com/nationaltaxlawassociates', order: 1 },
      { platform: 'twitter', url: 'https://twitter.com/ntla_pk', order: 2 },
      { platform: 'instagram', url: 'https://instagram.com/nationaltaxlawassociates', order: 3 },
      { platform: 'youtube', url: 'https://youtube.com/@nationaltaxlawassociates', order: 4 },
      { platform: 'linkedin', url: 'https://linkedin.com/company/nationaltaxlawassociates', order: 5 },
    ];

    for (const link of defaultLinks) {
      await SocialLink.findOneAndUpdate(
        { platform: link.platform },
        link,
        { upsert: true, new: true }
      );
    }

    const socialLinks = await SocialLink.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Social links seeded successfully',
      data: socialLinks,
    });
  } catch (error) {
    next(error);
  }
};
