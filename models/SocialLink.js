const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform name is required'],
      unique: true,
      enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'whatsapp'],
    },
    url: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SocialLink', socialLinkSchema);
