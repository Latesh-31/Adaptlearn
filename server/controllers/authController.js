const { z } = require('zod');

const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { signAccessToken } = require('../utils/jwt');

const registerSchema = z
  .object({
    username: z.string().min(2).max(50),
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
  })
  .strict();

const toPublicUser = (userDoc) => ({
  id: userDoc._id.toString(),
  username: userDoc.username,
  email: userDoc.email,
  role: userDoc.role,
  createdAt: userDoc.createdAt,
  updatedAt: userDoc.updatedAt,
});

const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError({
      status: 400,
      code: 'VALIDATION_001',
      message: 'Invalid input',
      details: parsed.error.flatten(),
    });
  }

  const { username, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError({
      status: 409,
      code: 'AUTH_002',
      message: 'Email is already registered',
    });
  }

  const user = await User.create({ username, email, password });

  const token = signAccessToken({ sub: user._id.toString(), role: user.role });
  setAuthCookie(res, token);

  res.status(201).json({ data: { user: toPublicUser(user) } });
});

const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError({
      status: 400,
      code: 'VALIDATION_001',
      message: 'Invalid input',
      details: parsed.error.flatten(),
    });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError({ status: 401, code: 'AUTH_001', message: 'Invalid credentials' });
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new ApiError({ status: 401, code: 'AUTH_001', message: 'Invalid credentials' });
  }

  const token = signAccessToken({ sub: user._id.toString(), role: user.role });
  setAuthCookie(res, token);

  res.status(200).json({ data: { user: toPublicUser(user) } });
});

module.exports = { register, login };
