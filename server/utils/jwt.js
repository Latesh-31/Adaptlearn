const jwt = require('jsonwebtoken');

const signAccessToken = (payload, { expiresIn = '7d' } = {}) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

const verifyAccessToken = (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || 
      (req.headers.authorization?.startsWith('Bearer ') 
        ? req.headers.authorization.slice(7) 
        : null);

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'AUTH_003',
          message: 'Access token is required'
        }
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'AUTH_004',
          message: 'Access token has expired'
        }
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'AUTH_005',
          message: 'Invalid access token'
        }
      });
    }

    return res.status(401).json({
      error: {
        code: 'AUTH_006',
        message: 'Token verification failed'
      }
    });
  }
};

module.exports = { signAccessToken, verifyAccessToken };
