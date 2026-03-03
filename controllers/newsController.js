const News = require('../models/News');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage for PDFs
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ntla-news-pdfs',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: (req, file) => `news-${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
  },
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// @desc    Get all news (public - only published)
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    let query = { isPublished: true };

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all news (admin - including unpublished)
// @route   GET /api/news/admin/all
// @access  Private/Admin
exports.getAllNews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await News.countDocuments();
    const news = await News.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single news
// @route   GET /api/news/:id
// @access  Public
exports.getSingleNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'name');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = async (req, res, next) => {
  try {
    const { title, description, category, isPublished } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file',
      });
    }

    const news = await News.create({
      title,
      description,
      category: category || 'general',
      isPublished: isPublished !== 'false',
      pdfUrl: req.file.path,
      pdfPublicId: req.file.filename,
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: news,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    next(error);
  }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res, next) => {
  try {
    const { title, description, category, isPublished } = req.body;

    let news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    // Update fields
    news.title = title || news.title;
    news.description = description !== undefined ? description : news.description;
    news.category = category || news.category;
    news.isPublished = isPublished !== undefined ? isPublished !== 'false' : news.isPublished;

    // If new PDF uploaded, delete old one and update
    if (req.file) {
      // Delete old PDF from Cloudinary
      if (news.pdfPublicId) {
        try {
          await cloudinary.uploader.destroy(news.pdfPublicId, { resource_type: 'raw' });
        } catch (error) {
          console.error('Error deleting old PDF:', error);
        }
      }
      news.pdfUrl = req.file.path;
      news.pdfPublicId = req.file.filename;
    }

    await news.save();

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    // Delete PDF from Cloudinary
    if (news.pdfPublicId) {
      try {
        await cloudinary.uploader.destroy(news.pdfPublicId, { resource_type: 'raw' });
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }
    }

    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Export multer middleware
exports.uploadPdf = uploadPdf;
