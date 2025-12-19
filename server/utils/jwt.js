const jwt = require('jsonwebtoken');

const signAccessToken = (payload, { expiresIn = '7d' } = {}) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = { signAccessToken };
