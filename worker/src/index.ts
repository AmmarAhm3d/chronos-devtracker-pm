import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import projects from './routes/projects';
import tasks from './routes/tasks';
import type { Env } from './middleware/auth';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors());

// Root route - API info
app.get('/', (c) => {
  return c.json({
    name: 'Chronos DevTracker API',
    version: '1.0.0',
    description: 'Portfolio Project Management Application API',
    endpoints: {
      health: '/health',
      healthz: '/healthz',
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks'
    }
  });
});

// Health check endpoints
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/healthz', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info route
app.get('/api', (c) => {
  return c.json({
    message: 'Welcome to Chronos DevTracker API',
    version: '1.0.0',
    routes: {
      'POST /api/auth/register': 'Register a new user',
      'POST /api/auth/login': 'Login user',
      'GET /api/projects': 'List all projects (auth required)',
      'POST /api/projects': 'Create a project (auth required)',
      'GET /api/projects/:id': 'Get project details (auth required)',
      'PUT /api/projects/:id': 'Update a project (auth required)',
      'DELETE /api/projects/:id': 'Delete a project (auth required)',
      'POST /api/projects/:id/tasks': 'Create task for project (auth required)',
      'PUT /api/tasks/:taskId': 'Update a task (auth required)',
      'DELETE /api/tasks/:taskId': 'Delete a task (auth required)'
    }
  });
});

// Mount route modules
app.route('/api/auth', auth);
app.route('/api/projects', projects);
app.route('/api/tasks', tasks);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
