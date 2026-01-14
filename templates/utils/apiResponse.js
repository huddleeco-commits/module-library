/**
 * API Response Helper
 *
 * Standardizes all API responses for consistency.
 * Every response follows the format: { success, data?, error?, meta? }
 */

/**
 * Success response
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
function success(res, data = null, message = null, statusCode = 200) {
  const response = {
    success: true,
    ...(data !== null && { data }),
    ...(message && { message })
  };
  return res.status(statusCode).json(response);
}

/**
 * Created response (201)
 */
function created(res, data, message = 'Created successfully') {
  return success(res, data, message, 201);
}

/**
 * Error response
 * @param {object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default 400)
 * @param {object} details - Additional error details
 */
function error(res, errorMessage, statusCode = 400, details = null) {
  const response = {
    success: false,
    error: errorMessage,
    ...(details && { details })
  };
  return res.status(statusCode).json(response);
}

/**
 * Not found response (404)
 */
function notFound(res, resource = 'Resource') {
  return error(res, `${resource} not found`, 404);
}

/**
 * Unauthorized response (401)
 */
function unauthorized(res, message = 'Authentication required') {
  return error(res, message, 401);
}

/**
 * Forbidden response (403)
 */
function forbidden(res, message = 'Access denied') {
  return error(res, message, 403);
}

/**
 * Validation error response (422)
 */
function validationError(res, errors) {
  return error(res, 'Validation failed', 422, { validationErrors: errors });
}

/**
 * Server error response (500)
 */
function serverError(res, err, includeStack = false) {
  console.error('Server Error:', err);
  const response = {
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      details: {
        message: err.message,
        ...(includeStack && { stack: err.stack })
      }
    })
  };
  return res.status(500).json(response);
}

/**
 * Paginated response
 * @param {object} res - Express response object
 * @param {array} items - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 */
function paginated(res, items, page, limit, total) {
  return success(res, {
    items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
}

/**
 * Express middleware for consistent error handling
 */
function errorHandler(err, req, res, next) {
  // Log error
  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  // Handle known error types
  if (err.name === 'ValidationError') {
    return validationError(res, err.errors);
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return unauthorized(res, 'Invalid or expired token');
  }

  if (err.code === '23505') {
    // PostgreSQL unique violation
    return error(res, 'A record with this value already exists', 409);
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key violation
    return error(res, 'Referenced record not found', 400);
  }

  // Default to server error
  return serverError(res, err);
}

module.exports = {
  success,
  created,
  error,
  notFound,
  unauthorized,
  forbidden,
  validationError,
  serverError,
  paginated,
  errorHandler
};
