const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const categoryController = require('./category.controller');
const subcategoryController = require('./subcategory.controller');
const subsubcategoryController = require('./subsubcategory.controller');
const { validateCreate: validateCategoryCreate, validateUpdate: validateCategoryUpdate } = require('./category.validation');
const { validateCreate: validateSubcategoryCreate, validateUpdate: validateSubcategoryUpdate } = require('./subcategory.validation');
const { validateCreate: validateSubsubcategoryCreate, validateUpdate: validateSubsubcategoryUpdate } = require('./subsubcategory.validation');

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
adminRouter.get('/subcategories/:id/subsubcategories', categoryController.listSubSubCategories);
adminRouter.get('/subcategories/:id', subcategoryController.getById);
adminRouter.post('/subcategories', validateSubcategoryCreate, subcategoryController.create);
adminRouter.put('/subcategories/:id', validateSubcategoryUpdate, subcategoryController.update);
adminRouter.delete('/subcategories/:id', subcategoryController.remove);

adminRouter.get('/subsubcategories', subsubcategoryController.list);
adminRouter.get('/subsubcategories/:id', subsubcategoryController.getById);
adminRouter.post('/subsubcategories', validateSubsubcategoryCreate, subsubcategoryController.create);
adminRouter.put('/subsubcategories/:id', validateSubsubcategoryUpdate, subsubcategoryController.update);
adminRouter.delete('/subsubcategories/:id', subsubcategoryController.remove);

module.exports = { publicRouter, adminRouter };
