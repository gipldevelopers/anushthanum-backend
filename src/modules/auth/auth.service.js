const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../../config/database');
const config = require('../../config');
const { sendOtpEmail } = require('../../utils/mailer');

const googleClient = config.GOOGLE_CLIENT_ID
  ? new OAuth2Client(config.GOOGLE_CLIENT_ID)
  : null;

const SALT_ROUNDS = 10;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateSlug() {
  return `user-${uuidv4().replace(/-/g, '').slice(0, 12)}`;
}

function toUserResponse(user) {
  if (!user) return null;
  return {
    id: user.id,
    uuid: user.uuid,
    slug: user.slug,
    email: user.email,
    name: user.name,
    phone: user.phone || '',
    avatar: user.avatar,
    memberSince: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : '',
    spiritualLevel: user.spiritualLevel,
    emailVerified: user.emailVerified,
  };
}

function signToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

async function register(body) {
  const { name, email, phone, password } = body;
  const emailLower = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) {
    if (existing.emailVerified) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }
    // Exists but not verified: update password and resend OTP
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);
    await prisma.user.update({
      where: { email: emailLower },
      data: {
        password: hashedPassword,
        name: (name || '').trim() || null,
        phone: (phone || '').trim() || null,
        emailOtp: otp,
        emailOtpExpires: expiresAt,
        otpLastSentAt: new Date(),
        otpAttempts: 0,
      },
    });
    try {
      await sendOtpEmail(emailLower, otp, (name || '').trim() || 'User', config.OTP_EXPIRY_MINUTES);
    } catch (e) {
      console.error('[Auth] Send OTP email failed:', e.message);
      if (config.NODE_ENV === 'development') {
        console.log('[Auth] OTP for', emailLower, ':', otp);
      }
    }
    return {
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: emailLower,
      ...(config.NODE_ENV === 'development' && { devOtp: otp }),
    };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const slug = generateSlug();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.user.create({
    data: {
      slug,
      email: emailLower,
      password: hashedPassword,
      name: (name || '').trim() || null,
      phone: (phone || '').trim() || null,
      emailVerified: false,
      emailOtp: otp,
      emailOtpExpires: expiresAt,
      otpLastSentAt: new Date(),
      otpAttempts: 0,
      isActive: true,
    },
  });

  try {
    await sendOtpEmail(emailLower, otp, (name || '').trim() || 'User', config.OTP_EXPIRY_MINUTES);
  } catch (e) {
    console.error('[Auth] Send OTP email failed:', e.message);
    if (config.NODE_ENV === 'development') {
      console.log('[Auth] OTP for', emailLower, ':', otp);
    }
  }

  return {
    message: 'OTP sent to your email. Please verify to complete registration.',
    email: emailLower,
    ...(config.NODE_ENV === 'development' && { devOtp: otp }),
  };
}

async function sendOtp(body) {
  const { email } = body;
  const emailLower = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: emailLower } });
  if (!user) {
    const err = new Error('No account found with this email.');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  if (user.otpLastSentAt && (now - new Date(user.otpLastSentAt)) / 1000 < RESEND_COOLDOWN_SEC) {
    const err = new Error(`Please wait ${RESEND_COOLDOWN_SEC} seconds before requesting a new OTP.`);
    err.statusCode = 429;
    throw err;
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);
  await prisma.user.update({
    where: { email: emailLower },
    data: {
      emailOtp: otp,
      emailOtpExpires: expiresAt,
      otpLastSentAt: now,
    },
  });

  try {
    await sendOtpEmail(emailLower, otp, user.name || 'User', config.OTP_EXPIRY_MINUTES);
  } catch (e) {
    console.error('[Auth] Resend OTP email failed:', e.message);
    if (config.NODE_ENV === 'development') {
      console.log('[Auth] Resend OTP for', emailLower, ':', otp);
    }
  }

  return {
    message: 'OTP sent to your email.',
    ...(config.NODE_ENV === 'development' && { devOtp: otp }),
  };
}

async function verifyOtp(body) {
  const { email, otp } = body;
  const emailLower = email.trim().toLowerCase();
  const otpTrim = String(otp).trim();

  const user = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (!user) {
    const err = new Error('Invalid or expired OTP. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }
  if (!user.emailOtp || !user.emailOtpExpires) {
    const err = new Error('Invalid or expired OTP. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }
  if (new Date() > user.emailOtpExpires) {
    await prisma.user.update({
      where: { email: emailLower },
      data: { emailOtp: null, emailOtpExpires: null },
    });
    const err = new Error('OTP has expired. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }
  if (user.emailOtp !== otpTrim) {
    await prisma.user.update({
      where: { email: emailLower },
      data: { otpAttempts: { increment: 1 } },
    });
    const err = new Error('Invalid OTP.');
    err.statusCode = 400;
    throw err;
  }

  await prisma.user.update({
    where: { email: emailLower },
    data: {
      emailVerified: true,
      emailOtp: null,
      emailOtpExpires: null,
      otpLastSentAt: null,
      otpAttempts: 0,
    },
  });

  const updated = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  const token = signToken({ userId: updated.id, email: updated.email, type: 'access' });
  return {
    message: 'Email verified. Account is active.',
    user: toUserResponse(updated),
    accessToken: token,
  };
}

async function login(body) {
  const { email, password } = body;
  const emailLower = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: emailLower } });
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  if (!user.password) {
    const err = new Error('This account uses a different sign-in method.');
    err.statusCode = 401;
    throw err;
  }
  if (!user.isActive) {
    const err = new Error('Account is deactivated.');
    err.statusCode = 403;
    throw err;
  }
  if (!user.emailVerified) {
    const err = new Error('Please verify your email first. Check your inbox for the OTP.');
    err.statusCode = 403;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ userId: user.id, email: user.email, type: 'access' });
  return {
    message: 'Signed in successfully.',
    user: toUserResponse(user),
    accessToken: token,
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      uuid: true,
      slug: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      spiritualLevel: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  if (!user) return null;
  return toUserResponse(user);
}

async function googleAuth(body) {
  const { token } = body;
  if (!token || typeof token !== 'string') {
    const err = new Error('Google token is required.');
    err.statusCode = 400;
    throw err;
  }
  if (!googleClient) {
    const err = new Error('Google sign-in is not configured.');
    err.statusCode = 503;
    throw err;
  }

  let payload;
  if (token.length > 500) {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } else {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = new Error('Failed to get user info from Google.');
      err.statusCode = 401;
      throw err;
    }
    payload = await res.json();
  }

  const googleId = payload.sub;
  const email = (payload.email || '').trim().toLowerCase();
  const name = (payload.name || '').trim() || null;
  const picture = payload.picture || null;

  if (!email) {
    const err = new Error('Google account has no email.');
    err.statusCode = 400;
    throw err;
  }

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (user && !user.isActive) {
    const err = new Error('Account is deactivated.');
    err.statusCode = 403;
    throw err;
  }

  if (!user) {
    const slug = generateSlug();
    const dummyPassword = await bcrypt.hash(uuidv4(), SALT_ROUNDS);
    user = await prisma.user.create({
      data: {
        slug,
        email,
        name,
        avatar: picture,
        googleId,
        password: dummyPassword,
        emailVerified: true,
        isActive: true,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId,
        avatar: picture || user.avatar,
        emailVerified: true,
      },
    });
  }

  const tokenOut = signToken({ userId: user.id, email: user.email, type: 'access' });
  return {
    message: 'Signed in with Google.',
    user: toUserResponse(user),
    accessToken: tokenOut,
  };
}

// ---------- Admin Auth ----------

function toAdminResponse(admin) {
  if (!admin) return null;
  return {
    id: admin.id,
    uuid: admin.uuid,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}

async function adminLogin(body) {
  const { email, password } = body;
  const emailLower = email.trim().toLowerCase();

  const admin = await prisma.adminUser.findUnique({
    where: { email: emailLower },
  });
  if (!admin) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  if (!admin.isActive) {
    const err = new Error('Account is deactivated.');
    err.statusCode = 403;
    throw err;
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({
    adminId: admin.id,
    email: admin.email,
    type: 'admin',
  });
  return {
    message: 'Admin signed in successfully.',
    admin: toAdminResponse(admin),
    accessToken: token,
  };
}

async function getAdminMe(adminId) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, uuid: true, email: true, name: true, role: true, isActive: true },
  });
  if (!admin || !admin.isActive) return null;
  return toAdminResponse(admin);
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
  signToken,
};
