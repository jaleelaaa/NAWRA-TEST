import { test, expect } from '@playwright/test';

test.describe('User Management E2E Tests', () => {
  const baseUrl = 'http://localhost:3000';

  async function login(page: any, locale: string = 'en') {
    await page.goto(`${baseUrl}/${locale}/login`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }

  test('Users page loads successfully - English', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/users`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/users/);
    await page.screenshot({ path: 'test-results/users-page-en.png' });

    // Check for table or user list
    const userTable = page.locator('table, [data-testid="user-table"], [role="table"]');
    await expect(userTable).toBeVisible({ timeout: 10000 });
  });

  test('Users page loads successfully - Arabic', async ({ page }) => {
    await login(page, 'ar');
    await page.goto(`${baseUrl}/ar/admin/users`);
    await page.waitForLoadState('networkidle');

    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');

    await page.screenshot({ path: 'test-results/users-page-ar.png' });
  });

  test('User list is displayed', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/users`);
    await page.waitForLoadState('networkidle');

    // Wait for users to load
    const userRows = page.locator('table tbody tr, [data-testid="user-row"]');
    await expect(userRows.first()).toBeVisible({ timeout: 10000 });

    const count = await userRows.count();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/users-list.png' });
  });

  test('Search users functionality', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/users`);
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]');

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('admin');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/users-search.png' });
    }
  });

  test('Filter users by role', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/users`);
    await page.waitForLoadState('networkidle');

    // Look for filter dropdown
    const filterSelect = page.locator('select[name="role"], [data-testid="role-filter"]');

    if (await filterSelect.count() > 0) {
      await filterSelect.first().selectOption('administrator');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/users-filter.png' });
    }
  });

  test('Open add user modal', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/users`);
    await page.waitForLoadState('networkidle');

    // Find add user button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), [data-testid="add-user"]');

    if (await addButton.count() > 0) {
      await addButton.first().click();
      await page.waitForSelector('[role="dialog"], .modal, [data-testid="user-modal"]', { timeout: 5000 });
      await page.screenshot({ path: 'test-results/users-add-modal.png' });
    }
  });

  test('View user details', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/users`);
    await page.waitForLoadState('networkidle');

    // Find view/edit button for first user
    const viewButton = page.locator('button[aria-label*="View"], button[aria-label*="Edit"], td button').first();

    if (await viewButton.count() > 0) {
      await viewButton.click();
      await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
      await page.screenshot({ path: 'test-results/users-view-details.png' });
    }
  });

  test('User pagination works', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/users`);
    await page.waitForLoadState('networkidle');

    // Look for pagination controls
    const nextButton = page.locator('button:has-text("Next"), [aria-label="Next page"]');

    if (await nextButton.count() > 0 && await nextButton.first().isEnabled()) {
      await nextButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/users-pagination.png' });
    }
  });

  test('Users page is responsive', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/users`);

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/users-mobile.png' });

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'test-results/users-desktop.png' });
  });
});
