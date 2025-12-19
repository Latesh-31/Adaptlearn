class ApiError extends Error {
  constructor({ status = 500, code = 'INTERNAL_ERROR', message = 'Something went wrong', details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = { ApiError };
