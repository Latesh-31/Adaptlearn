const { ApiError } = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  const normalized = err instanceof ApiError
    ? err
    : new ApiError({
        status: 500,
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      });

  const payload = {
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.details ? { details: normalized.details } : {}),
    },
  };

  if (process.env.NODE_ENV !== 'production' && !(err instanceof ApiError)) {
    payload.error.stack = err.stack;
  }

  res.status(normalized.status).json(payload);
};

module.exports = { errorHandler };
