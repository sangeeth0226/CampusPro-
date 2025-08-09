const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error Details:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.user?._id
    });
  } else {
    // In production, log only essential information
    console.error('🚨 Production Error:', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      user: req.user?._id
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = {
      message,
      statusCode: 400,
      code: 'INVALID_ID'
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    error = {
      message,
      statusCode: 400,
      code: 'DUPLICATE_FIELD'
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    error = {
      message: messages.join(', '),
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token has expired',
      statusCode: 401,
      code: 'EXPIRED_TOKEN'
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File size too large',
      statusCode: 400,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files uploaded',
      statusCode: 400,
      code: 'TOO_MANY_FILES'
    };
  }

  // OpenAI API errors
  if (err.response?.status === 429) {
    error = {
      message: 'AI service temporarily unavailable. Please try again later.',
      statusCode: 503,
      code: 'AI_SERVICE_UNAVAILABLE'
    };
  }

  if (err.response?.status === 401 && err.config?.url?.includes('openai')) {
    error = {
      message: 'AI service configuration error',
      statusCode: 500,
      code: 'AI_SERVICE_ERROR'
    };
  }

  // Database connection errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    error = {
      message: 'Database service temporarily unavailable',
      statusCode: 503,
      code: 'DATABASE_ERROR'
    };
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
    error = {
      message: 'External service temporarily unavailable',
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE'
    };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    error = {
      message: 'Too many requests. Please try again later.',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Default error response structure
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error
    })
  };

  // Add additional error context for specific status codes
  if (error.statusCode === 400) {
    response.type = 'Bad Request';
  } else if (error.statusCode === 401) {
    response.type = 'Unauthorized';
  } else if (error.statusCode === 403) {
    response.type = 'Forbidden';
  } else if (error.statusCode === 404) {
    response.type = 'Not Found';
  } else if (error.statusCode === 409) {
    response.type = 'Conflict';
  } else if (error.statusCode === 422) {
    response.type = 'Unprocessable Entity';
  } else if (error.statusCode === 429) {
    response.type = 'Too Many Requests';
    response.retryAfter = error.retryAfter || 60; // seconds
  } else if (error.statusCode === 500) {
    response.type = 'Internal Server Error';
  } else if (error.statusCode === 503) {
    response.type = 'Service Unavailable';
  }

  res.status(error.statusCode || 500).json(response);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFound
};
