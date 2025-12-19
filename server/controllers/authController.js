const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'instructor']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Standardized error response helper
const sendError = (res, statusCode, code, message) => {
  res.status(statusCode).json({
    error: {
      code,
      message
    }
  });
};

exports.register = async (req, res) => {
  try {
    // 1. Validate Input
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 400, 'VAL_001', result.error.issues[0].message);
    }

    const { username, email, password, role } = result.data;

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'AUTH_002', 'Email already in use');
    }

    // 3. Create user
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    // 4. Create token
    const token = signToken(user._id);

    // 5. Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    sendError(res, 500, 'SRV_001', 'Internal server error');
  }
};

exports.login = async (req, res) => {
  try {
    // 1. Validate Input
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 400, 'VAL_001', result.error.issues[0].message);
    }

    const { email, password } = result.data;

    // 2. Check for user and password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'AUTH_001', 'Invalid credentials');
    }

    // 3. Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'AUTH_001', 'Invalid credentials');
    }

    // 4. Create token
    const token = signToken(user._id);

    // 5. Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    sendError(res, 500, 'SRV_001', 'Internal server error');
  }
};
