const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('express-async-errors');

const config = require('./config');
const authRoutes = require('./modules/auth/auth.routes');
const { publicRouter: categoriesPublicRouter, adminRouter: categoriesAdminRouter } = require('./modules/categories/category.routes');
const { publicRouter: blogsPublicRouter, adminRouter: blogsAdminRouter } = require('./modules/blogs/blog.routes');
const uploadRoutes = require('./modules/upload/upload.routes');

const app = express();

app.use(helmet());

if (config.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);
}

const allowedOrigins = (config.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Anushthanum API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesPublicRouter);
app.use('/api/blogs', blogsPublicRouter);
app.use('/api/admin', categoriesAdminRouter);
app.use('/api/admin/blogs', blogsAdminRouter);
app.use('/api/admin/upload', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    err.statusCode = 400;
    err.message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message;
  }
  const statusCode = err.statusCode || 500;
  console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
