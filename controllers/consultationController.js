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

// @desc    Get signed URL for consultation file
// @route   GET /api/consultations/:id/file-url
// @access  Private/Admin
exports.getFileSignedUrl = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    if (!consultation.noticeFileUrl) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this consultation',
      });
    }

    const fileUrl = consultation.noticeFileUrl;
    const publicId = consultation.noticeFilePublicId;
    
    // Detect resource type from original URL
    let resourceType = 'image';
    if (fileUrl.includes('/raw/upload/')) {
      resourceType = 'raw';
    }
    
    const isPdf = fileUrl.toLowerCase().includes('.pdf');
    
    let result = {
      url: fileUrl,
      originalUrl: fileUrl,
      isPdf: isPdf,
      resourceType: resourceType,
      method: 'original'
    };

    if (publicId) {
      try {
        // Use Cloudinary's private_download_url for blocked/authenticated resources
        // This generates a time-limited signed URL that bypasses access restrictions
        const downloadUrl = cloudinary.utils.private_download_url(publicId, isPdf ? 'pdf' : 'jpg', {
          resource_type: resourceType,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        });
        
        result.url = downloadUrl;
        result.method = 'private_download';
        console.log(`Generated private download URL for ${publicId}`);
      } catch (downloadErr) {
        console.log('Private download failed:', downloadErr.message);
        
        // Fallback: Try with alternate resource type
        const altType = resourceType === 'image' ? 'raw' : 'image';
        try {
          const altDownloadUrl = cloudinary.utils.private_download_url(publicId, isPdf ? 'pdf' : 'jpg', {
            resource_type: altType,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          });
          result.url = altDownloadUrl;
          result.resourceType = altType;
          result.method = 'private_download_alt';
          console.log(`Generated alt private download URL for ${publicId}`);
        } catch (altErr) {
          console.log('Alt download also failed:', altErr.message);
          result.method = 'fallback_original';
        }
      }
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fix blocked file by re-uploading with public access
// @route   POST /api/consultations/:id/fix-file
// @access  Private/Admin
exports.fixBlockedFile = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    if (!consultation.noticeFileUrl || !consultation.noticeFilePublicId) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this consultation',
      });
    }

    const oldPublicId = consultation.noticeFilePublicId;
    const oldUrl = consultation.noticeFileUrl;
    const isPdf = oldUrl.toLowerCase().includes('.pdf');
    
    // Detect current resource type from URL
    let currentResourceType = 'image';
    if (oldUrl.includes('/raw/upload/')) {
      currentResourceType = 'raw';
    }

    console.log(`Fixing file: ${oldPublicId}, isPdf: ${isPdf}, currentType: ${currentResourceType}`);

    try {
      // First, try to update the existing resource to public access
      // Try with the resource type based on URL
      await cloudinary.api.update(oldPublicId, {
        resource_type: currentResourceType,
        access_mode: 'public'
      });
      
      console.log(`Successfully updated ${oldPublicId} to public access`);
      
      res.status(200).json({
        success: true,
        message: 'File access updated to public',
        data: {
          url: oldUrl,
          publicId: oldPublicId,
          method: 'updated_access'
        }
      });
    } catch (updateErr) {
      console.log('Update failed, trying re-upload approach:', updateErr.message);
      
      // If update fails, try re-uploading from the existing URL
      // Use eager transformation to get a fresh copy
      try {
        const newUploadResult = await cloudinary.uploader.upload(oldUrl, {
          resource_type: isPdf ? 'raw' : 'image',
          folder: 'tax-notices',
          access_mode: 'public',
          overwrite: false,
          unique_filename: true
        });

        // Update consultation with new file info
        consultation.noticeFileUrl = newUploadResult.secure_url;
        consultation.noticeFilePublicId = newUploadResult.public_id;
        await consultation.save();

        // Try to delete old file (ignore errors)
        try {
          await cloudinary.uploader.destroy(oldPublicId, { resource_type: currentResourceType });
        } catch (e) {
          console.log('Could not delete old file:', e.message);
        }

        console.log(`Re-uploaded file: ${newUploadResult.public_id}`);

        res.status(200).json({
          success: true,
          message: 'File re-uploaded with public access',
          data: {
            url: newUploadResult.secure_url,
            publicId: newUploadResult.public_id,
            method: 're_uploaded'
          }
        });
      } catch (reuploadErr) {
        console.error('Re-upload failed:', reuploadErr.message);
        res.status(500).json({
          success: false,
          message: 'Could not fix file access. Please re-upload the file manually.',
          error: reuploadErr.message
        });
      }
    }
  } catch (error) {
    next(error);
  }
};
