import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';

// Load environment variables
dotenv.config({ path: '../.env' }); // Load .env from repository root (one level up from server/)

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route - API info
app.get('/', (_req, res) => {
  res.json({
    name: 'Chronos DevTracker API',
    version: '1.0.0',
    description: 'Portfolio Project Management Application API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks'
    }
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info route
app.get('/api', (_req, res) => {
  res.json({
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
      'PUT /api/tasks/:id': 'Update a task (auth required)',
      'DELETE /api/tasks/:id': 'Delete a task (auth required)'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
