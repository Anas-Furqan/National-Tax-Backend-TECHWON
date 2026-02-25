const Consultant = require('../models/Consultant');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all consultants
// @route   GET /api/consultants
// @access  Public
exports.getConsultants = async (req, res, next) => {
  try {
    const consultants = await Consultant.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: consultants.length,
      data: consultants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all consultants (admin - including inactive)
// @route   GET /api/consultants/admin
// @access  Private
exports.getAllConsultants = async (req, res, next) => {
  try {
    const consultants = await Consultant.find()
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: consultants.length,
      data: consultants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single consultant
// @route   GET /api/consultants/:id
// @access  Public
exports.getConsultant = async (req, res, next) => {
  try {
    const consultant = await Consultant.findById(req.params.id);

    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: consultant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new consultant
// @route   POST /api/consultants
// @access  Private (Admin only)
exports.createConsultant = async (req, res, next) => {
  try {
    // Handle image from upload
    if (req.file) {
      req.body.image = req.file.path;
      req.body.imagePublicId = req.file.filename;
    }

    // Convert specializations to array if it's a string
    if (req.body.specializations && typeof req.body.specializations === 'string') {
      req.body.specializations = req.body.specializations.split(',').map(s => s.trim());
    }

    const consultant = await Consultant.create(req.body);

    res.status(201).json({
      success: true,
      data: consultant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consultant
// @route   PUT /api/consultants/:id
// @access  Private (Admin only)
exports.updateConsultant = async (req, res, next) => {
  try {
    let consultant = await Consultant.findById(req.params.id);

    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found',
      });
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (consultant.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(consultant.imagePublicId);
        } catch (err) {
          console.error('Error deleting old consultant image:', err);
        }
      }

      req.body.image = req.file.path;
      req.body.imagePublicId = req.file.filename;
    }

    // Convert specializations to array if it's a string
    if (req.body.specializations && typeof req.body.specializations === 'string') {
      req.body.specializations = req.body.specializations.split(',').map(s => s.trim());
    }

    consultant = await Consultant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: consultant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete consultant
// @route   DELETE /api/consultants/:id
// @access  Private (Admin only)
exports.deleteConsultant = async (req, res, next) => {
  try {
    const consultant = await Consultant.findById(req.params.id);

    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found',
      });
    }

    // Delete image from Cloudinary if it exists
    if (consultant.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(consultant.imagePublicId);
      } catch (err) {
        console.error('Error deleting consultant image:', err);
      }
    }

    await consultant.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
