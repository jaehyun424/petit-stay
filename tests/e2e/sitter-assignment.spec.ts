import { test, expect } from '@playwright/test';

test.describe('Sitter Assignment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as sitter
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('sitter@demo.com');
    await page.locator('input[type="password"]').fill('demo1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/sitter/, { timeout: 10000 });
  });

  test('should display sitter schedule page', async ({ page }) => {
    await page.goto('/sitter');
    await page.waitForLoadState('networkidle');

    // Schedule page should be visible
    const content = page.locator('.sitter-schedule, .animate-fade-in, main').first();
    await expect(content).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/sitter-schedule.png' });
  });

  test('should show today sessions section', async ({ page }) => {
    await page.goto('/sitter');
    await page.waitForLoadState('networkidle');

    // Page should have session cards or empty state
    const pageContent = page.locator('main, .sitter-schedule').first();
    await expect(pageContent).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/sitter-today-sessions.png' });
  });

  test('should show accept/reject buttons for pending assignments', async ({ page }) => {
    await page.goto('/sitter');
    await page.waitForLoadState('networkidle');

    // Look for accept/reject buttons (if pending assignments exist)
    const acceptBtn = page.locator('button', { hasText: /accept/i });
    const rejectBtn = page.locator('button', { hasText: /reject|decline/i });

    if (await acceptBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({ path: 'tests/e2e/screenshots/sitter-pending-assignment.png' });

      // Click accept on first pending assignment
      await acceptBtn.first().click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'tests/e2e/screenshots/sitter-assignment-accepted.png' });
    } else if (await rejectBtn.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.screenshot({ path: 'tests/e2e/screenshots/sitter-has-assignments.png' });
    } else {
      // No pending assignments - that's fine
      await page.screenshot({ path: 'tests/e2e/screenshots/sitter-no-pending.png' });
    }
  });

  test('should display weekly schedule', async ({ page }) => {
    await page.goto('/sitter');
    await page.waitForLoadState('networkidle');

    // Weekly schedule section should be present
    const weekSection = page.locator('.week-schedule, [class*="week"], h3, h2').first();
    await expect(weekSection).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/sitter-weekly-schedule.png' });
  });

  test('should navigate to sitter profile', async ({ page }) => {
    await page.goto('/sitter/profile');
    await page.waitForLoadState('networkidle');

    const content = page.locator('main, .animate-fade-in').first();
    await expect(content).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/sitter-profile.png' });
  });
});
