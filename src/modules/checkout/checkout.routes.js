const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const checkoutController = require('./checkout.controller');

const router = express.Router();

// Create order (guest or logged-in) - optional auth
router.post('/create-order', authMiddleware.optionalAuth, checkoutController.createOrder);

// Verify Razorpay payment
router.post('/verify-payment', checkoutController.verifyPayment);

// Get order by orderNumber (for success/failure page)
router.get('/order/:orderNumber', checkoutController.getOrder);

module.exports = router;
