require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'anushthanum-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,

  // Email (SMTP)
  SMTP: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 2525,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@anushthanum.com',
  FROM_NAME: process.env.FROM_NAME || 'Anushthanum',

  // Google OAuth (client_id only; used to verify id_token)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
};
