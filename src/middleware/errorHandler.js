import { logger } from '../utils/logger.js';

/**
 * Central Express error handler — must be registered last.
 * Always responds with JSON error envelope.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;
  const code = err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = status < 500 ? err.message : 'An unexpected error occurred';

  if (status >= 500) {
    logger.error(
      { err, cause: err.cause, req: { method: req.method, url: req.url } },
      'Server error'
    );
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
