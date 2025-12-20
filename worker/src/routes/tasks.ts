import { Hono } from 'hono';
import { z } from 'zod';
import { getPrismaClient } from '../lib/prisma';
import { authenticate, type Env, type Variables } from '../middleware/auth';
import { validate } from '../middleware/validate';

const tasks = new Hono<{ Bindings: Env; Variables: Variables }>();

// Validation schemas
const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  completed: z.boolean().optional(),
});

// PUT /api/tasks/:taskId - Update a task
tasks.put('/:taskId', authenticate, validate(updateTaskSchema), async (c) => {
  try {
    const userId = c.get('userId');
    const { taskId } = c.req.param();
    const { title, priority, completed } = await c.req.json();
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    // Verify task exists and belongs to user's project
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    if (existingTask.project.userId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(priority && { priority }),
        ...(completed !== undefined && { completed }),
      },
    });

    return c.json(task, 200);
  } catch (error) {
    console.error('Update task error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /api/tasks/:taskId - Delete a task
tasks.delete('/:taskId', authenticate, async (c) => {
  try {
    const userId = c.get('userId');
    const { taskId } = c.req.param();
    const prisma = getPrismaClient(c.env.DATABASE_URL);

    // Verify task exists and belongs to user's project
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    if (existingTask.project.userId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await prisma.task.delete({ where: { id: taskId } });

    return c.json({ message: 'Task deleted successfully' }, 200);
  } catch (error) {
    console.error('Delete task error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default tasks;
