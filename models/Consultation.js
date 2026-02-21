const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true,
    },
    serviceType: {
      type: String,
      enum: [
        'Income Tax',
        'Sales Tax',
        'Customs',
        'GST',
        'SECP',
        'Trademark',
        'WEBOC',
        'NTN Registration',
        'Other',
      ],
      default: 'Other',
    },
    message: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    noticeFileUrl: {
      type: String,
      default: '',
    },
    noticeFilePublicId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtering
consultationSchema.index({ status: 1, createdAt: -1 });
consultationSchema.index({ email: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
