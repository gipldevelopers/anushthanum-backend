const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const contentController = require('./content.controller');

// Public routes (storefront uses these)
const publicRouter = express.Router();
publicRouter.get('/:key', contentController.getPage);

// Admin routes (protected)
const adminRouter = express.Router();
adminRouter.use(authMiddleware.authenticateAdmin);
adminRouter.get('/:key', contentController.getPage);
adminRouter.put('/:key', contentController.upsertPage);

module.exports = { publicRouter, adminRouter };
