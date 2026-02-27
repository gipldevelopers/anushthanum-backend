const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required().messages({
    'string.empty': 'Name is required',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email',
  }),
  phone: Joi.string().trim().max(20).allow('', null),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
  }),
});

const sendOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().trim().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must contain only digits',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

const adminLoginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

const googleAuthSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    'string.empty': 'Google token is required',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().trim().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must contain only digits',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
  }),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }
    req.body = value;
    next();
  };
}

module.exports = {
  validateRegister: validate(registerSchema),
  validateSendOtp: validate(sendOtpSchema),
  validateVerifyOtp: validate(verifyOtpSchema),
  validateLogin: validate(loginSchema),
  validateAdminLogin: validate(adminLoginSchema),
  validateGoogleAuth: validate(googleAuthSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
};
