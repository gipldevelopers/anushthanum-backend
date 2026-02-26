const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const orderController = require('./order.controller');

const adminRouter = express.Router();

// All routes here require admin authentication
adminRouter.use(authMiddleware.authenticateAdmin);

adminRouter.get('/', orderController.listAdmin);
adminRouter.get('/:id', orderController.getById);
adminRouter.patch('/:id/status', orderController.updateStatus);

module.exports = { adminRouter };
