const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');
const {
  validateRegister,
  validateSendOtp,
  validateVerifyOtp,
  validateLogin,
  validateGoogleAuth,
  validateAdminLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('./auth.validation');

const router = express.Router();

// ---------- User (customer) auth ----------
router.post('/register', validateRegister, authController.register);
router.post('/send-otp', validateSendOtp, authController.sendOtp);
router.post('/verify-otp', validateVerifyOtp, authController.verifyOtp);
router.post('/login', validateLogin, authController.login);
router.post('/google', validateGoogleAuth, authController.googleAuth);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/me', authMiddleware.authenticate, authController.getMe);


// ---------- Admin auth ----------
router.post('/admin/login', validateAdminLogin, authController.adminLogin);
router.get('/admin/me', authMiddleware.authenticateAdmin, authController.getAdminMe);

module.exports = router;
