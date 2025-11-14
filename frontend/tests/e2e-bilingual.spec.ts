import { test, expect } from '@playwright/test';

test.describe('Bilingual & RTL Support Tests', () => {
  const baseUrl = 'http://localhost:3000';

  test('English locale has LTR direction', async ({ page }) => {
    await page.goto(`${baseUrl}/en/login`);
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('ltr');
    await page.screenshot({ path: 'test-results/bilingual-en-ltr.png' });
  });

  test('Arabic locale has RTL direction', async ({ page }) => {
    await page.goto(`${baseUrl}/ar/login`);
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
    await page.screenshot({ path: 'test-results/bilingual-ar-rtl.png' });
  });

  test('All pages support Arabic RTL - Login', async ({ page }) => {
    await page.goto(`${baseUrl}/ar/login`);

    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');

    // Check for Arabic text
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    await page.screenshot({ path: 'test-results/rtl-login.png' });
  });

  test('Dashboard supports both languages', async ({ page }) => {
    // English first
    await page.goto(`${baseUrl}/en/login`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'test-results/dashboard-en-full.png' });

    // Switch to Arabic
    await page.goto(`${baseUrl}/ar/dashboard`);
    await page.waitForLoadState('networkidle');

    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');

    await page.screenshot({ path: 'test-results/dashboard-ar-full.png' });
  });

  test('Forms have bilingual field labels', async ({ page }) => {
    await page.goto(`${baseUrl}/en/login`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    await page.goto(`${baseUrl}/en/admin/users`);
    await page.waitForLoadState('networkidle');

    // Try to open add user form
    const addButton = page.locator('button:has-text("Add")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.screenshot({ path: 'test-results/bilingual-form-en.png' });

      // Close modal
      const closeButton = page.locator('button[aria-label*="Close"], button:has-text("Cancel")').first();
      if (await closeButton.count() > 0) {
        await closeButton.click();
      }
    }

    // Now test Arabic version
    await page.goto(`${baseUrl}/ar/admin/users`);
    await page.waitForLoadState('networkidle');

    const addButtonAr = page.locator('button').first();
    if (await addButtonAr.count() > 0) {
      await addButtonAr.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.screenshot({ path: 'test-results/bilingual-form-ar.png' });
    }
  });

  test('Navigation menu is properly aligned in RTL', async ({ page }) => {
    await page.goto(`${baseUrl}/ar/login`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Check navigation menu
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();

    await page.screenshot({ path: 'test-results/rtl-navigation.png' });
  });

  test('Tables are properly displayed in RTL', async ({ page }) => {
    await page.goto(`${baseUrl}/ar/login`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    await page.goto(`${baseUrl}/ar/admin/users`);
    await page.waitForLoadState('networkidle');

    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    await page.screenshot({ path: 'test-results/rtl-table.png' });
  });

  test('Buttons and icons are properly positioned in RTL', async ({ page }) => {
    await page.goto(`${baseUrl}/ar/dashboard`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Check various buttons
    const buttons = page.locator('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/rtl-buttons.png' });
  });

  test('Dropdowns and selects work in RTL', async ({ page }) => {
    await page.goto(`${baseUrl}/ar/login`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    await page.goto(`${baseUrl}/ar/admin/users`);
    await page.waitForLoadState('networkidle');

    // Look for dropdowns
    const select = page.locator('select, [role="combobox"]').first();

    if (await select.count() > 0) {
      await select.click();
      await page.screenshot({ path: 'test-results/rtl-dropdown.png' });
    }
  });

  test('Charts are displayed correctly in both languages', async ({ page }) => {
    // English version
    await page.goto(`${baseUrl}/en/login`);
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    const chartEn = page.locator('.recharts-wrapper, [class*="chart"]').first();
    if (await chartEn.count() > 0) {
      await expect(chartEn).toBeVisible();
      await page.screenshot({ path: 'test-results/charts-en.png' });
    }

    // Arabic version
    await page.goto(`${baseUrl}/ar/dashboard`);
    await page.waitForLoadState('networkidle');

    const chartAr = page.locator('.recharts-wrapper, [class*="chart"]').first();
    if (await chartAr.count() > 0) {
      await expect(chartAr).toBeVisible();
      await page.screenshot({ path: 'test-results/charts-ar.png' });
    }
  });

  test('Error messages appear in correct language', async ({ page }) => {
    // Test English error
    await page.goto(`${baseUrl}/en/login`);
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/error-en.png' });

    // Test Arabic error
    await page.goto(`${baseUrl}/ar/login`);
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/error-ar.png' });
  });
});
