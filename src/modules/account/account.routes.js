const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const accountController = require('./account.controller');

const router = express.Router();
router.use(authMiddleware.authenticate);

router.get('/overview', accountController.getOverview);
router.get('/orders', accountController.getOrders);
router.get('/addresses', accountController.getAddresses);
router.post('/addresses', accountController.createAddress);
router.put('/addresses/:id', accountController.updateAddress);
router.delete('/addresses/:id', accountController.deleteAddress);
router.get('/wishlist', accountController.getWishlist);
router.delete('/wishlist/:productId', accountController.removeWishlistItem);
router.patch('/profile', accountController.updateProfile);
router.post('/change-password', accountController.changePassword);
router.delete('/account', accountController.deleteAccount);

module.exports = router;
