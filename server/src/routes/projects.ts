import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { Status } from '@prisma/client';

const router = Router();

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

// GET /api/projects - List all projects for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
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

    res.status(200).json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects - Create a new project
router.post('/', authenticate, validate(createProjectSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, repoLink } = req.body;

    const project = await prisma.project.create({
      data: {
        userId: req.userId!,
        title,
        description: description || null,
        status: (status as Status) || 'TODO',
        repoLink: repoLink || null,
      },
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id - Get a specific project with tasks
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

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
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify ownership
    if (project.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/projects/:id - Update a project
router.put('/:id', authenticate, validate(updateProjectSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, repoLink } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findUnique({ where: { id } });
    
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (existingProject.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status: status as Status }),
        ...(repoLink !== undefined && { repoLink: repoLink || null }),
      },
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.status(200).json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findUnique({ where: { id } });
    
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (existingProject.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.project.delete({ where: { id } });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects/:id/tasks - Create a new task for a project (PRD-compliant path)
router.post('/:id/tasks', authenticate, validate(z.object({
  title: z.string().min(1, 'Title is required'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
})), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // project id
    const { title, priority } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
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
        projectId: id,
        title,
        priority: (priority as any) || 'MEDIUM',
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task (project path) error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
