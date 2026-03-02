const express = require('express');
const router = express.Router();
const dashboardController = require('../dashboard/dashboard.controller');
const authMiddleware = require('../auth/auth.middleware');

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', authMiddleware.authenticateAdmin, dashboardController.getStats);

module.exports = router;
