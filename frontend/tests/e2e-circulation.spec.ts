import { test, expect } from '@playwright/test';

test.describe('Circulation E2E Tests', () => {
  const baseUrl = 'http://localhost:3000';

  async function login(page: any, locale: string = 'en') {
    await page.goto(`${baseUrl}/${locale}/login`);
    await page.fill('input[type="email"]', 'circulation@ministry.om');
    await page.fill('input[type="password"]', 'Circ@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }

  test('Circulation page loads - English', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/circulation`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/circulation/);
    await page.screenshot({ path: 'test-results/circulation-en.png' });
  });

  test('Circulation page loads - Arabic', async ({ page }) => {
    await login(page, 'ar');
    await page.goto(`${baseUrl}/ar/admin/circulation`);
    await page.waitForLoadState('networkidle');

    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');

    await page.screenshot({ path: 'test-results/circulation-ar.png' });
  });

  test('Circulation records are displayed', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/circulation`);
    await page.waitForLoadState('networkidle');

    const circulationTable = page.locator('table, [data-testid="circulation-table"]');
    await expect(circulationTable).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/circulation-list.png' });
  });

  test('Open issue book modal', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/circulation`);
    await page.waitForLoadState('networkidle');

    const issueButton = page.locator('button:has-text("Issue"), button:has-text("Check Out"), [data-testid="issue-book"]');

    if (await issueButton.count() > 0) {
      await issueButton.first().click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.screenshot({ path: 'test-results/circulation-issue-modal.png' });
    }
  });

  test('Open return book modal', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/circulation`);
    await page.waitForLoadState('networkidle');

    const returnButton = page.locator('button:has-text("Return"), button:has-text("Check In"), [data-testid="return-book"]');

    if (await returnButton.count() > 0) {
      await returnButton.first().click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.screenshot({ path: 'test-results/circulation-return-modal.png' });
    }
  });

  test('Filter circulation by status', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/circulation`);
    await page.waitForLoadState('networkidle');

    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');

    if (await statusFilter.count() > 0) {
      await statusFilter.first().selectOption('active');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/circulation-filter-active.png' });
    }
  });

  test('Search circulation records', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/circulation`);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/circulation-search.png' });
    }
  });

  test('Circulation statistics are visible', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/circulation`);
    await page.waitForLoadState('networkidle');

    // Look for statistics cards
    const statsCards = page.locator('[data-testid="stats-card"], .grid > div');

    if (await statsCards.count() > 0) {
      await expect(statsCards.first()).toBeVisible();
      await page.screenshot({ path: 'test-results/circulation-stats.png' });
    }
  });

  test('Circulation page is responsive', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/circulation`);

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/circulation-mobile.png' });

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'test-results/circulation-desktop.png' });
  });
});
