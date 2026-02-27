const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('express-async-errors');

const config = require('./config');
const authRoutes = require('./modules/auth/auth.routes');
const accountRoutes = require('./modules/account/account.routes');
const checkoutRoutes = require('./modules/checkout/checkout.routes');
const { publicRouter: categoriesPublicRouter, adminRouter: categoriesAdminRouter } = require('./modules/categories/category.routes');
const { publicRouter: blogsPublicRouter, adminRouter: blogsAdminRouter } = require('./modules/blogs/blog.routes');
const { publicRouter: productsPublicRouter, adminRouter: productsAdminRouter } = require('./modules/products/product.routes');
const { publicRouter: contentPublicRouter, adminRouter: contentAdminRouter } = require('./modules/content/content.routes');
const { publicRouter: filterAttributesPublicRouter, adminRouter: filterAttributesAdminRouter } = require('./modules/filterAttributes/filterAttribute.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const userRoutes = require('./modules/users/user.routes');
const { adminRouter: ordersAdminRouter } = require('./modules/orders/order.routes');


const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

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

const fs = require('fs');
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Fallback logic for missing seeded dummy images
app.use('/uploads/:folder/:filename', (req, res, next) => {
  const { folder, filename } = req.params;
  
  // Extract base name without timestamp prefix and file extension
  const match = filename.match(/^\d+-(.+)\.[^.]+$/);
  if (!match) return next();
  
  const baseName = match[1].toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetDir = path.join(process.cwd(), '../frontend/public/images', folder);
  
  if (fs.existsSync(targetDir)) {
    try {
      const files = fs.readdirSync(targetDir);
      // Attempt to find a matching file in frontend/public/images/:folder
      const foundFile = files.find(f => {
        const fileBase = f.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return fileBase === baseName || fileBase.includes(baseName) || baseName.includes(fileBase);
      });
      
      if (foundFile) {
        return res.sendFile(path.join(targetDir, foundFile));
      }
    } catch (e) {
      // Ignore directory read errors
    }
  }
  
  // Final fallback to a generic placeholder to prevent broken images
  res.sendFile(path.join(process.cwd(), '../frontend/public/placeholder.svg'), (err) => {
    if (err) next();
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Anushthanum API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/categories', categoriesPublicRouter);
app.use('/api/blogs', blogsPublicRouter);
app.use('/api/products', productsPublicRouter);
app.use('/api/filter-attributes', filterAttributesPublicRouter);
app.use('/api/content', contentPublicRouter);
app.use('/api/admin', categoriesAdminRouter);
app.use('/api/admin', userRoutes);
app.use('/api/admin/blogs', blogsAdminRouter);
app.use('/api/admin/products', productsAdminRouter);
app.use('/api/admin/filter-attributes', filterAttributesAdminRouter);
app.use('/api/admin/content', contentAdminRouter);
app.use('/api/admin/orders', ordersAdminRouter);
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
