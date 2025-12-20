import { Hono } from 'hono';
import { z } from 'zod';
import { getPrismaClient } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { validate } from '../middleware/validate';
import type { Env, Variables } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
auth.post('/register', validate(registerSchema), async (c) => {
  try {
    const { email, password, name } = c.get('requestBody') as any;
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await generateToken({ userId: user.id, email: user.email }, c.env.JWT_SECRET);

    return c.json({
      message: 'User registered successfully',
      token,
      user,
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/auth/login
auth.post('/login', validate(loginSchema), async (c) => {
  try {
    const { email, password } = c.get('requestBody') as any;
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Generate JWT token
    const token = await generateToken({ userId: user.id, email: user.email }, c.env.JWT_SECRET);

    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default auth;
