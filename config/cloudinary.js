const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for tax notice documents (PDF/JPG)
const noticeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tax-notices',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
  },
});

// Storage for blog thumbnails
const blogStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 450, crop: 'fill' }],
  },
});

// Storage for consultant profile images
const consultantStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'consultant-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

const uploadNotice = multer({ storage: noticeStorage });
const uploadBlogImage = multer({ storage: blogStorage });
const uploadConsultantImage = multer({ storage: consultantStorage });

module.exports = {
  cloudinary,
  uploadNotice,
  uploadBlogImage,
  uploadConsultantImage,
};
