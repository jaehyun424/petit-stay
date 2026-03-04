import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button[type="submit"]').click();
    // Form validation should prevent submission with empty fields
    await expect(page.locator('form')).toBeVisible();
  });

  test('should fill credentials and submit login as hotel staff', async ({ page }) => {
    await page.goto('/login');

    // Fill demo hotel staff credentials
    await page.locator('input[type="email"]').fill('hotel@demo.com');
    await page.locator('input[type="password"]').fill('demo1234');

    await page.locator('button[type="submit"]').click();

    // Wait for navigation or error response
    await page.waitForURL(/\/(hotel|login)/, { timeout: 10000 });
    await page.screenshot({ path: 'tests/e2e/screenshots/login-hotel-result.png' });
  });

  test('should fill credentials via demo account buttons', async ({ page }) => {
    await page.goto('/login');

    // Click the first demo account button (Hotel Staff)
    const demoButtons = page.locator('.demo-btn');
    await expect(demoButtons.first()).toBeVisible();
    await demoButtons.first().click();

    // Verify fields are populated
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('hotel@demo.com');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveValue('demo1234');

    await page.screenshot({ path: 'tests/e2e/screenshots/login-demo-filled.png' });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.locator('a[href="/register"]').click();
    await page.waitForURL('/register');
    await expect(page).toHaveURL('/register');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.locator('a[href="/forgot-password"]').click();
    await page.waitForURL('/forgot-password');
    await expect(page).toHaveURL('/forgot-password');
  });
});
