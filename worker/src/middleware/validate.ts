import { Context, MiddlewareHandler } from 'hono';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation middleware for Hono
 * Validates request body against Zod schema
 * Parses body once and stores it in context for route handlers
 */
export const validate = (schema: ZodSchema): MiddlewareHandler => {
  return async (c: Context, next) => {
    try {
      const body = await c.req.json();
      const parsedBody = schema.parse(body);
      // Store parsed body for route handlers
      c.set('requestBody', parsedBody);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        }, 400);
      }
      return c.json({ error: 'Invalid request body' }, 400);
    }
  };
};
