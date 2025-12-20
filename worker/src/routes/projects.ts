import { Hono } from 'hono';
import { z } from 'zod';
import { getPrismaClient } from '../lib/prisma';
import { authenticate, type Env, type Variables } from '../middleware/auth';
import { validate } from '../middleware/validate';

const projects = new Hono<{ Bindings: Env; Variables: Variables }>();

// Validation schemas
const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETE', 'ON_HOLD']).optional(),
  repoLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETE', 'ON_HOLD']).optional(),
  repoLink: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
});

// GET /api/projects - List all projects for authenticated user
projects.get('/', authenticate, async (c) => {
  try {
    const userId = c.get('userId');
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    const projectsList = await prisma.project.findMany({
      where: { userId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(projectsList, 200);
  } catch (error) {
    console.error('Get projects error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/projects - Create a new project
projects.post('/', authenticate, validate(createProjectSchema), async (c) => {
  try {
    const userId = c.get('userId');
    const { title, description, status, repoLink } = c.get('requestBody') as any;
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    const project = await prisma.project.create({
      data: {
        userId,
        title,
        description: description || null,
        status: status || 'TODO',
        repoLink: repoLink || null,
      },
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
    });

    return c.json(project, 201);
  } catch (error) {
    console.error('Create project error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/projects/:id - Get a specific project with tasks
projects.get('/:id', authenticate, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Verify ownership
    if (project.userId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json(project, 200);
  } catch (error) {
    console.error('Get project error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /api/projects/:id - Update a project
projects.put('/:id', authenticate, validate(updateProjectSchema), async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const { title, description, status, repoLink } = c.get('requestBody') as any;
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findUnique({ where: { id } });

    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }

    if (existingProject.userId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(repoLink !== undefined && { repoLink: repoLink || null }),
      },
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
    });

    return c.json(project, 200);
  } catch (error) {
    console.error('Update project error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /api/projects/:id - Delete a project
projects.delete('/:id', authenticate, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findUnique({ where: { id } });

    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }

    if (existingProject.userId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await prisma.project.delete({ where: { id } });

    return c.json({ message: 'Project deleted successfully' }, 200);
  } catch (error) {
    console.error('Delete project error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /api/projects/:id/tasks - Create a new task for a project
projects.post('/:id/tasks', authenticate, validate(createTaskSchema), async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param(); // project id
    const { title, priority } = c.get('requestBody') as any;
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    if (project.userId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const task = await prisma.task.create({
      data: {
        projectId: id,
        title,
        priority: priority || 'MEDIUM',
      },
    });

    return c.json(task, 201);
  } catch (error) {
    console.error('Create task (project path) error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default projects;
