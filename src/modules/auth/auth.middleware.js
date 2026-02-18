const jwt = require('jsonwebtoken');
const config = require('../../config');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
    });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.type !== 'access' || !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Admin token is required',
    });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.type !== 'admin' || !decoded.adminId) {
      return res.status(401).json({ success: false, message: 'Invalid admin token' });
    }
    req.adminId = decoded.adminId;
    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.type === 'access' && decoded.userId) {
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    }
  } catch (_) {
    // ignore
  }
  next();
}

module.exports = {
  authenticate,
  authenticateAdmin,
  optionalAuth,
};
