const Consultation = require('../models/Consultation');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create consultation request
// @route   POST /api/consultations
// @access  Public
exports.createConsultation = async (req, res, next) => {
  try {
    const consultationData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      serviceType: req.body.serviceType,
      message: req.body.message,
    };

    // Handle file upload
    if (req.file) {
      consultationData.noticeFileUrl = req.file.path;
      consultationData.noticeFilePublicId = req.file.filename;
    }

    const consultation = await Consultation.create(consultationData);

    res.status(201).json({
      success: true,
      data: consultation,
      message: 'Your consultation request has been submitted successfully. We will contact you shortly.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all consultations
// @route   GET /api/consultations
// @access  Private/Admin
exports.getConsultations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by service type
    if (req.query.serviceType) {
      query.serviceType = req.query.serviceType;
    }

    // Filter by urgent
    if (req.query.isUrgent) {
      query.isUrgent = req.query.isUrgent === 'true';
    }

    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .sort({ isUrgent: -1, createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: consultations.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: consultations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single consultation
// @route   GET /api/consultations/:id
// @access  Private/Admin
exports.getConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consultation status
// @route   PUT /api/consultations/:id
// @access  Private/Admin
exports.updateConsultation = async (req, res, next) => {
  try {
    let consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // Track when status changes to reviewed
    if (req.body.status && req.body.status !== 'Pending' && !consultation.respondedAt) {
      req.body.respondedAt = new Date();
    }

    consultation = await Consultation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete consultation
// @route   DELETE /api/consultations/:id
// @access  Private/Admin
exports.deleteConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // Delete file from cloudinary if exists
    if (consultation.noticeFilePublicId) {
      await cloudinary.uploader.destroy(consultation.noticeFilePublicId);
    }

    await consultation.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Consultation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get consultation stats
// @route   GET /api/consultations/stats
// @access  Private/Admin
exports.getConsultationStats = async (req, res, next) => {
  try {
    const stats = await Consultation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const serviceStats = await Consultation.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Consultation.countDocuments();
    const pending = await Consultation.countDocuments({ status: 'Pending' });
    const urgent = await Consultation.countDocuments({ isUrgent: true, status: 'Pending' });

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Consultation.countDocuments({
      createdAt: { $gte: today },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        urgent,
        todayCount,
        byStatus: stats,
        byService: serviceStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
