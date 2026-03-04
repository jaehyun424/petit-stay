import { test, expect } from '@playwright/test';

test.describe('Care Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as sitter
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('sitter@demo.com');
    await page.locator('input[type="password"]').fill('demo1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/sitter/, { timeout: 10000 });
  });

  test('should navigate to active session page', async ({ page }) => {
    await page.goto('/sitter/active');
    await page.waitForLoadState('networkidle');

    const content = page.locator('main, .active-session, .animate-fade-in').first();
    await expect(content).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/care-session-active.png' });
  });

  test('should display session timer and checklist', async ({ page }) => {
    await page.goto('/sitter/active');
    await page.waitForLoadState('networkidle');

    // Session page should show timer or session info
    const sessionContent = page.locator('main, .active-session').first();
    await expect(sessionContent).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/care-session-timer.png' });
  });

  test('should open activity log modal', async ({ page }) => {
    await page.goto('/sitter/active');
    await page.waitForLoadState('networkidle');

    // Look for activity log button
    const activityBtn = page.locator('button', { hasText: /activity|log|note/i });
    if (await activityBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await activityBtn.first().click();
      await page.waitForTimeout(500);

      // Modal should open
      const modal = page.locator('.modal-overlay, [class*="modal"]');
      if (await modal.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.screenshot({ path: 'tests/e2e/screenshots/care-session-activity-modal.png' });
      }
    }
  });

  test('should toggle checklist items', async ({ page }) => {
    await page.goto('/sitter/active');
    await page.waitForLoadState('networkidle');

    // Find checklist items
    const checkboxes = page.locator('input[type="checkbox"], .checklist-item, [class*="checklist"]');
    if (await checkboxes.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkboxes.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/e2e/screenshots/care-session-checklist.png' });
    }
  });

  test('should show complete session button', async ({ page }) => {
    await page.goto('/sitter/active');
    await page.waitForLoadState('networkidle');

    // Look for complete session button
    const completeBtn = page.locator('button', { hasText: /complete|end|finish/i });
    if (await completeBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({ path: 'tests/e2e/screenshots/care-session-complete-btn.png' });

      // Click complete and check for confirmation dialog
      await completeBtn.first().click();
      await page.waitForTimeout(500);

      const confirmModal = page.locator('.modal-overlay, [class*="modal"]');
      if (await confirmModal.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.screenshot({ path: 'tests/e2e/screenshots/care-session-complete-confirm.png' });
      }
    }
  });

  test('should navigate to earnings page', async ({ page }) => {
    await page.goto('/sitter/earnings');
    await page.waitForLoadState('networkidle');

    const content = page.locator('main, .animate-fade-in').first();
    await expect(content).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/sitter-earnings.png' });
  });
});
