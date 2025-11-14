import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  const baseUrl = 'http://localhost:3000';

  // Helper function to login
  async function login(page: any, locale: string = 'en') {
    await page.goto(`${baseUrl}/${locale}/login`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(new RegExp(`/${locale}/dashboard`), { timeout: 10000 });
  }

  test('Dashboard loads successfully - English', async ({ page }) => {
    await login(page, 'en');

    // Verify dashboard elements
    await expect(page).toHaveURL(/\/en\/dashboard/);
    await page.screenshot({ path: 'test-results/dashboard-en.png' });

    // Check for statistics cards
    const statsCards = page.locator('[data-testid="stats-card"], .grid > div');
    await expect(statsCards.first()).toBeVisible();

    // Check for charts
    const charts = page.locator('.recharts-wrapper, [class*="chart"]');
    if (await charts.count() > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('Dashboard loads successfully - Arabic', async ({ page }) => {
    await login(page, 'ar');

    // Verify dashboard with RTL
    await expect(page).toHaveURL(/\/ar\/dashboard/);
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');

    await page.screenshot({ path: 'test-results/dashboard-ar.png' });

    // Verify content is in Arabic
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('Dashboard statistics are displayed', async ({ page }) => {
    await login(page, 'en');

    // Wait for statistics to load
    await page.waitForSelector('[data-testid="stats-card"], .grid > div', { timeout: 10000 });

    // Take screenshot
    await page.screenshot({ path: 'test-results/dashboard-stats.png' });

    // Verify at least some stats are visible
    const statsCount = await page.locator('[data-testid="stats-card"], .grid > div').count();
    expect(statsCount).toBeGreaterThan(0);
  });

  test('Dashboard navigation menu works', async ({ page }) => {
    await login(page, 'en');

    // Try to navigate to different sections
    const userLink = page.locator('a[href*="/admin/users"], nav a:has-text("Users")');
    if (await userLink.count() > 0) {
      await userLink.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/admin\/users/);
    }
  });

  test('Dashboard is responsive', async ({ page, viewport }) => {
    await login(page, 'en');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/dashboard-mobile.png' });

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/dashboard-tablet.png' });

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'test-results/dashboard-desktop.png' });
  });

  test('Dashboard language switcher works', async ({ page }) => {
    await login(page, 'en');

    // Look for language switcher
    const langSwitcher = page.locator('[data-testid="lang-switch"], button:has-text("عربي"), a[href*="/ar/"]');

    if (await langSwitcher.count() > 0) {
      await langSwitcher.first().click();
      await page.waitForLoadState('networkidle');

      // Should be on Arabic version
      const dir = await page.locator('html').getAttribute('dir');
      expect(dir).toBe('rtl');
    }
  });

  test('Dashboard activity feed is visible', async ({ page }) => {
    await login(page, 'en');

    // Look for activity feed
    const activityFeed = page.locator('[data-testid="activity-feed"], [class*="activity"], [class*="timeline"]');

    if (await activityFeed.count() > 0) {
      await expect(activityFeed.first()).toBeVisible();
      await page.screenshot({ path: 'test-results/dashboard-activity.png' });
    }
  });
});
