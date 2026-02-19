const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const categoryController = require('./category.controller');
const subcategoryController = require('./subcategory.controller');
const { validateCreate: validateCategoryCreate, validateUpdate: validateCategoryUpdate } = require('./category.validation');
const { validateCreate: validateSubcategoryCreate, validateUpdate: validateSubcategoryUpdate } = require('./subcategory.validation');

// Public router: GET /api/categories (no auth)
const publicRouter = express.Router();
publicRouter.get('/', categoryController.listPublic);

// Admin router: /api/admin/categories and /api/admin/subcategories (Bearer admin token)
const adminRouter = express.Router();
adminRouter.use(authMiddleware.authenticateAdmin);

adminRouter.get('/categories', categoryController.listAdmin);
adminRouter.get('/categories/:id/subcategories', categoryController.listSubCategories);
adminRouter.get('/categories/:id', categoryController.getById);
adminRouter.post('/categories', validateCategoryCreate, categoryController.create);
adminRouter.put('/categories/:id', validateCategoryUpdate, categoryController.update);
adminRouter.delete('/categories/:id', categoryController.remove);

adminRouter.get('/subcategories', subcategoryController.list);
adminRouter.get('/subcategories/:id', subcategoryController.getById);
adminRouter.post('/subcategories', validateSubcategoryCreate, subcategoryController.create);
adminRouter.put('/subcategories/:id', validateSubcategoryUpdate, subcategoryController.update);
adminRouter.delete('/subcategories/:id', subcategoryController.remove);

module.exports = { publicRouter, adminRouter };
