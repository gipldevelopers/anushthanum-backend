const authService = require('./auth.service');

async function register(req, res) {
  const data = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: data.message,
    email: data.email,
    ...(data.devOtp && { devOtp: data.devOtp }),
  });
}

async function sendOtp(req, res) {
  const data = await authService.sendOtp(req.body);
  res.json({
    success: true,
    message: data.message,
    ...(data.devOtp && { devOtp: data.devOtp }),
  });
}

async function verifyOtp(req, res) {
  const data = await authService.verifyOtp(req.body);
  res.json({
    success: true,
    message: data.message,
    user: data.user,
    accessToken: data.accessToken,
  });
}

async function login(req, res) {
  const data = await authService.login(req.body);
  res.json({
    success: true,
    message: data.message,
    user: data.user,
    accessToken: data.accessToken,
  });
}

async function getMe(req, res) {
  const user = await authService.getMe(req.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({
    success: true,
    user,
  });
}

async function googleAuth(req, res) {
  const data = await authService.googleAuth(req.body);
  res.json({
    success: true,
    message: data.message,
    user: data.user,
    accessToken: data.accessToken,
  });
}

async function adminLogin(req, res) {
  const data = await authService.adminLogin(req.body);
  res.json({
    success: true,
    message: data.message,
    admin: data.admin,
    accessToken: data.accessToken,
  });
}

async function getAdminMe(req, res) {
  const admin = await authService.getAdminMe(req.adminId);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }
  res.json({
    success: true,
    admin,
  });
}

async function forgotPassword(req, res) {
  const data = await authService.forgotPassword(req.body);
  res.json({
    success: true,
    message: data.message,
    ...(data.devOtp && { devOtp: data.devOtp }),
  });
}

async function resetPassword(req, res) {
  const data = await authService.resetPassword(req.body);
  res.json({
    success: true,
    message: data.message,
  });
}


module.exports = {
  register,
  sendOtp,
  verifyOtp,
  login,
  getMe,
  googleAuth,
  adminLogin,
  getAdminMe,
  forgotPassword,
  resetPassword,
};
