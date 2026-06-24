import { test, expect } from '@playwright/test';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';
const email = `e2e-${Date.now()}@test.fitcore.app`;
const password = 'TestPass123!';
const fullName = 'E2E Test User';

test.describe('Critical User Path', () => {

  test('1. Register a new user', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toHaveText('Create account');

    await page.fill('input[type="text"]', fullName);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/login');
    await expect(page.locator('h1')).toHaveText('Sign in');
  });

  test('2. Login with new credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveText('Sign in');

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/');
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });

  test('3. Dashboard shows user info', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await expect(page.getByText(fullName)).toBeVisible();
    await expect(page.getByText('member')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();
  });

  test('4. Gyms page shows empty state', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.click('a[href="/gyms"]');
    await page.waitForURL('/gyms');
    await expect(page.locator('h1')).toHaveText('Gyms');
    await expect(page.getByText('No gyms found.')).toBeVisible();
  });

  test('5. Create gym via API and verify on gyms page', async ({ page }) => {
    const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
    const token = loginRes.data.data.accessToken;

    const gymRes = await axios.post(`${API_URL}/gyms`, {
      gymName: 'E2E Test Gym',
      email: 'gym@test.fitcore.app',
      phone: '9999999999',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'IN',
      pincode: '123456',
      licenseNumber: `LIC-${Date.now()}`,
    }, { headers: { Authorization: `Bearer ${token}` } });
    expect(gymRes.status).toBe(201);

    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.click('a[href="/gyms"]');
    await page.waitForURL('/gyms');
    await expect(page.getByText('E2E Test Gym')).toBeVisible();
  });

  test('6. Profile page shows user info and password change works', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.click('a[href="/profile"]');
    await page.waitForURL('/profile');
    await expect(page.locator('h1')).toHaveText('Profile');
    await expect(page.getByText(email)).toBeVisible();

    const newPassword = 'NewPass456!';
    await page.fill('input[type="password"]:below(label:has-text("Current password"))', password);
    await page.fill('input[type="password"]:below(label:has-text("New password"))', newPassword);
    await page.click('button:has-text("Update password")');
    await expect(page.getByText('Password changed successfully')).toBeVisible();

    // Test logout
    await page.click('button:has-text("Sign out")');
    await page.waitForURL('**/login');

    // Re-login with new password
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', newPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });

  test('7. Forgot password flow renders', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toHaveText('Forgot password');
    await page.fill('input[type="email"]', email);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/reset link sent|check your email/i)).toBeVisible();
  });

  test('8. Unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login');
    await expect(page.locator('h1')).toHaveText('Sign in');
  });

});
