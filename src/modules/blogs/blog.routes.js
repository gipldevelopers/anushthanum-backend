const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const blogController = require('./blog.controller');
const { validateCreate, validateUpdate } = require('./blog.validation');

const publicRouter = express.Router();
publicRouter.get('/', blogController.listPublic);
publicRouter.get('/:slug', blogController.getBySlug);

const adminRouter = express.Router();
adminRouter.use(authMiddleware.authenticateAdmin);
adminRouter.get('/', blogController.listAdmin);
adminRouter.get('/:id', blogController.getById);
adminRouter.post('/', validateCreate, blogController.create);
adminRouter.put('/:id', validateUpdate, blogController.update);
adminRouter.delete('/:id', blogController.remove);

module.exports = { publicRouter, adminRouter };
