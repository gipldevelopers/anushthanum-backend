const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const userController = require('./user.controller');

const router = express.Router();
router.use(authMiddleware.authenticateAdmin);

router.get('/users', userController.list);
router.get('/users/:id', userController.getById);
router.put('/users/:id', userController.update);

module.exports = router;
