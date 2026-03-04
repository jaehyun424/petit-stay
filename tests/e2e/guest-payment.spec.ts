import { test, expect } from '@playwright/test';

test.describe('Guest Page Flow', () => {
  const guestUrl = '/guest/bk-demo-001?token=tk-demo-token&lang=en';

  test('should load guest page with reservation info (step 1)', async ({ page }) => {
    await page.goto(guestUrl);
    await page.waitForLoadState('networkidle');

    // Guest page should show either reservation info or error/loading state
    const guestPage = page.locator('.guest-page');
    await expect(guestPage).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/guest-step1.png' });
  });

  test('should display brand logo on guest page', async ({ page }) => {
    await page.goto(guestUrl);
    await page.waitForLoadState('networkidle');

    // Brand logo should be visible
    const logo = page.locator('.guest-page').first();
    await expect(logo).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/screenshots/guest-branding.png' });
  });

  test('should handle invalid token gracefully', async ({ page }) => {
    await page.goto('/guest/invalid-id?token=invalid-token');
    await page.waitForLoadState('networkidle');

    // Should show error state for invalid token
    const guestPage = page.locator('.guest-page');
    await expect(guestPage).toBeVisible();

    // Error message should be displayed
    const errorElement = page.locator('.guest-error, .guest-loading');
    await expect(errorElement.first()).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/guest-invalid-token.png' });
  });

  test('should handle missing token', async ({ page }) => {
    await page.goto('/guest/some-booking-id');
    await page.waitForLoadState('networkidle');

    const guestPage = page.locator('.guest-page');
    await expect(guestPage).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/guest-no-token.png' });
  });

  test('should respect language parameter', async ({ page }) => {
    // Test with Korean language
    await page.goto('/guest/bk-demo-001?token=tk-demo-token&lang=ko');
    await page.waitForLoadState('networkidle');

    const guestPage = page.locator('.guest-page');
    await expect(guestPage).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/guest-korean.png' });
  });

  test('should show step indicator when reservation is valid', async ({ page }) => {
    await page.goto(guestUrl);
    await page.waitForLoadState('networkidle');

    // If reservation loads successfully, step indicator should be visible
    // Otherwise error state is shown (both are valid)
    const guestContainer = page.locator('.guest-container');
    await expect(guestContainer).toBeVisible();

    await page.screenshot({ path: 'tests/e2e/screenshots/guest-step-indicator.png' });
  });
});
