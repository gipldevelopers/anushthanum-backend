const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const productController = require('./product.controller');
const { validateCreate, validateUpdate } = require('./product.validation');

const publicRouter = express.Router();
publicRouter.get('/', productController.listPublic);
publicRouter.get('/:slug', productController.getBySlug);

const adminRouter = express.Router();
adminRouter.use(authMiddleware.authenticateAdmin);
adminRouter.get('/', productController.listAdmin);
adminRouter.get('/:id', productController.getById);
adminRouter.post('/', validateCreate, productController.create);
adminRouter.put('/:id', validateUpdate, productController.update);
adminRouter.delete('/:id', productController.remove);

module.exports = { publicRouter, adminRouter };
