import createError from 'http-errors';

/**
 * Returns Express middleware that validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (and defaulted) value.
 * On failure, forwards a 400 VALIDATION_ERROR to next().
 *
 * @param {import('zod').ZodSchema} schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      const err = createError(400, 'Validation failed');
      err.code = 'VALIDATION_ERROR';
      err.details = details;
      return next(err);
    }
    req.body = result.data;
    next();
  };
}
