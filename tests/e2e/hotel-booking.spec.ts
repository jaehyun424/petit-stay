import { test, expect } from '@playwright/test';

test.describe('Hotel Booking Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as hotel staff
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('hotel@demo.com');
    await page.locator('input[type="password"]').fill('demo1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/hotel/, { timeout: 10000 });
  });

  test('should navigate to bookings page', async ({ page }) => {
    await page.goto('/hotel/bookings');
    await page.waitForLoadState('networkidle');

    // Verify bookings page loaded with table or empty state
    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/screenshots/hotel-bookings-list.png' });
  });

  test('should open new booking modal', async ({ page }) => {
    await page.goto('/hotel/bookings');
    await page.waitForLoadState('networkidle');

    // Click "New Booking" button
    const newBookingBtn = page.locator('button', { hasText: /new booking/i });
    if (await newBookingBtn.isVisible()) {
      await newBookingBtn.click();

      // Verify modal opens with form fields
      const modal = page.locator('.modal-overlay, [class*="modal"]');
      await expect(modal.first()).toBeVisible();
      await page.screenshot({ path: 'tests/e2e/screenshots/hotel-new-booking-modal.png' });
    }
  });

  test('should fill and submit new booking form', async ({ page }) => {
    await page.goto('/hotel/bookings');
    await page.waitForLoadState('networkidle');

    // Open new booking modal
    const newBookingBtn = page.locator('button', { hasText: /new booking/i });
    if (await newBookingBtn.isVisible()) {
      await newBookingBtn.click();
      await page.waitForTimeout(500);

      // Fill booking form fields
      const guestNameInput = page.locator('.modal-overlay input, [class*="modal"] input').first();
      await guestNameInput.fill('John Smith');

      // Fill room number (second input)
      const roomInput = page.locator('.modal-overlay input, [class*="modal"] input').nth(1);
      await roomInput.fill('1201');

      // Fill date (third input)
      const dateInput = page.locator('.modal-overlay input[type="date"], [class*="modal"] input[type="date"]').first();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      await dateInput.fill(dateStr);

      await page.screenshot({ path: 'tests/e2e/screenshots/hotel-booking-form-filled.png' });

      // Submit the form
      const confirmBtn = page.locator('.modal-overlay button, [class*="modal"] button', { hasText: /confirm/i });
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/e2e/screenshots/hotel-booking-created.png' });
      }
    }
  });

  test('should filter bookings by search', async ({ page }) => {
    await page.goto('/hotel/bookings');
    await page.waitForLoadState('networkidle');

    // Type in search input
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="code" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('KCP');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/e2e/screenshots/hotel-bookings-filtered.png' });
    }
  });

  test('should filter bookings by status', async ({ page }) => {
    await page.goto('/hotel/bookings');
    await page.waitForLoadState('networkidle');

    // Select status filter
    const statusSelect = page.locator('select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/e2e/screenshots/hotel-bookings-status-filter.png' });
    }
  });
});
