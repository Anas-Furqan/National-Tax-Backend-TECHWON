const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    pdfUrl: {
      type: String,
      required: [true, 'PDF file is required'],
    },
    pdfPublicId: {
      type: String,
    },
    category: {
      type: String,
      enum: ['circular', 'notification', 'news', 'update', 'general'],
      default: 'general',
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
newsSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('News', newsSchema);
