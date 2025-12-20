import { MiddlewareHandler } from 'hono';
import { verifyToken } from '../lib/jwt';

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  ENVIRONMENT?: string;
};

export type Variables = {
  userId: string;
  requestBody?: any;
};

/**
 * Authentication middleware for Hono
 * Verifies Bearer token and sets userId in context
 */
export const authenticate: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const secret = c.env.JWT_SECRET;
    
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const decoded = await verifyToken(token, secret);
    c.set('userId', decoded.userId);

    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};
