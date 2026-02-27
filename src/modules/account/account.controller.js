const accountService = require('./account.service');

async function getOverview(req, res) {
  const userId = req.userId;
  const data = await accountService.getOverview(userId);
  if (!data) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, ...data });
}

async function getOrders(req, res) {
  const userId = req.userId;
  const data = await accountService.getOrders(userId, req.query);
  res.json({ success: true, ...data });
}

async function getAddresses(req, res) {
  const userId = req.userId;
  const addresses = await accountService.getAddresses(userId);
  res.json({ success: true, addresses });
}

async function createAddress(req, res) {
  const userId = req.userId;
  const address = await accountService.createAddress(userId, req.body);
  res.status(201).json({ success: true, address });
}

async function updateAddress(req, res) {
  const userId = req.userId;
  const id = req.params.id;
  const address = await accountService.updateAddress(userId, id, req.body);
  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }
  res.json({ success: true, address });
}

async function deleteAddress(req, res) {
  const userId = req.userId;
  const id = req.params.id;
  const deleted = await accountService.deleteAddress(userId, id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }
  res.json({ success: true, message: 'Address deleted' });
}

async function getWishlist(req, res) {
  const userId = req.userId;
  const wishlist = await accountService.getWishlist(userId);
  res.json({ success: true, wishlist });
}

async function addWishlistItem(req, res) {
  const userId = req.userId;
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  const item = await accountService.addWishlistItem(userId, productId);
  res.status(201).json({ success: true, message: 'Added to wishlist', item });
}

async function updateProfile(req, res) {
  const userId = req.userId;
  const user = await accountService.updateProfile(userId, req.body);
  res.json({ success: true, user });
}

async function changePassword(req, res) {
  const userId = req.userId;
  await accountService.changePassword(userId, req.body);
  res.json({ success: true, message: 'Password updated successfully' });
}

async function deleteAccount(req, res) {
  const userId = req.userId;
  const result = await accountService.softDeleteAccount(userId);
  if (!result) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, message: 'Account deactivated successfully', user: result });
}

async function removeWishlistItem(req, res) {
  const userId = req.userId;
  const productId = req.params.productId;
  const deleted = await accountService.removeWishlistItem(userId, productId);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Wishlist item not found' });
  }
  res.json({ success: true, message: 'Removed from wishlist' });
}

module.exports = {
  getOverview,
  getOrders,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  updateProfile,
  changePassword,
  deleteAccount,
};
