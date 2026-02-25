const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const controller = require('./filterAttribute.controller');
const { validateCreateCategory, validateUpdateCategory, validateCreateAttribute, validateUpdateAttribute } = require('./filterAttribute.validation');

const publicRouter = express.Router();
publicRouter.get('/', controller.listCategoriesPublic);

const adminRouter = express.Router();
adminRouter.use(authMiddleware.authenticateAdmin);

adminRouter.get('/', controller.listCategoriesAdmin);
adminRouter.get('/:id', controller.getCategoryById);
adminRouter.post('/', validateCreateCategory, controller.createCategory);
adminRouter.put('/:id', validateUpdateCategory, controller.updateCategory);
adminRouter.delete('/:id', controller.deleteCategory);

adminRouter.post('/attributes', validateCreateAttribute, controller.createAttribute);
adminRouter.put('/attributes/:id', validateUpdateAttribute, controller.updateAttribute);
adminRouter.delete('/attributes/:id', controller.deleteAttribute);

module.exports = { publicRouter, adminRouter };
