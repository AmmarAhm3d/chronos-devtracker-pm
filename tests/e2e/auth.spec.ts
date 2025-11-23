import { test, expect } from '@playwright/test';

// Basic auth flow using API endpoints directly
test.describe('Authentication Flow', () => {
  const email = `user_${Date.now()}@example.com`;
  const password = 'password123';

  test('register then login', async ({ request }) => {
    // Register
    const registerResp = await request.post('http://localhost:3001/api/auth/register', {
      data: { email, password }
    });
    expect(registerResp.ok()).toBeTruthy();
    const registerJson = await registerResp.json();
    expect(registerJson.token).toBeTruthy();

    // Login
    const loginResp = await request.post('http://localhost:3001/api/auth/login', {
      data: { email, password }
    });
    expect(loginResp.ok()).toBeTruthy();
    const loginJson = await loginResp.json();
    expect(loginJson.token).toBeTruthy();
  });
});