import { test, expect } from '@playwright/test';

test.describe('Project and Task CRUD', () => {
  const email = `proj_${Date.now()}@example.com`;
  const password = 'password123';
  let token: string;
  let projectId: string;
  let taskId: string;

  test.beforeAll(async ({ request }) => {
    const reg = await request.post('http://localhost:3001/api/auth/register', { data: { email, password } });
    const regJson = await reg.json();
    token = regJson.token;
  });

  test('create project', async ({ request }) => {
    const resp = await request.post('http://localhost:3001/api/projects', {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Portfolio Project', description: 'Demo project' }
    });
    expect(resp.ok()).toBeTruthy();
    const json = await resp.json();
    projectId = json.id;
    expect(json.title).toBe('Portfolio Project');
  });

  test('create task', async ({ request }) => {
    const resp = await request.post(`http://localhost:3001/api/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'First Task', priority: 'HIGH' }
    });
    expect(resp.ok()).toBeTruthy();
    const json = await resp.json();
    taskId = json.id;
    expect(json.title).toBe('First Task');
  });

  test('update task completion', async ({ request }) => {
    const resp = await request.put(`http://localhost:3001/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { completed: true }
    });
    expect(resp.ok()).toBeTruthy();
    const json = await resp.json();
    expect(json.completed).toBe(true);
  });

  test('fetch project with tasks', async ({ request }) => {
    const resp = await request.get(`http://localhost:3001/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(resp.ok()).toBeTruthy();
    const json = await resp.json();
    expect(json.tasks.length).toBeGreaterThan(0);
  });
});
