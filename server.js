const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const consultationRoutes = require('./routes/consultations');
const newsletterRoutes = require('./routes/newsletter');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.FRONTEND_URL || '*')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);

      if (allowedOrigins.includes('*') || !origin) {
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
