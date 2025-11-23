import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  completed: z.boolean().optional(),
});

// POST /api/projects/:projectId/tasks - Create a new task for a project
router.post('/:projectId/tasks', authenticate, validate(createTaskSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { title, priority } = req.body;

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        priority: priority || 'MEDIUM',
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tasks/:taskId - Update a task
router.put('/:taskId', authenticate, validate(updateTaskSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { title, priority, completed } = req.body;

    // Verify task exists and belongs to user's project
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (existingTask.project.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(priority && { priority }),
        ...(completed !== undefined && { completed }),
      },
    });

    res.status(200).json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:taskId - Delete a task
router.delete('/:taskId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    // Verify task exists and belongs to user's project
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (existingTask.project.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
