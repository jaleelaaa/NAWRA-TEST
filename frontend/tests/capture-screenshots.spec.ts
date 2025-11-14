import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '..', '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('NAWRA Application Screenshots', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test('01 - Capture Login Page (English)', async ({ page }) => {
    await page.goto('/en/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, '01-login-english.png'),
      fullPage: true,
    });
  });

  test('02 - Capture Login Page (Arabic)', async ({ page }) => {
    await page.goto('/ar/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, '02-login-arabic.png'),
      fullPage: true,
    });
  });

  test('03 - Capture Dashboard (English) - After Login', async ({ page }) => {
    // Login first
    await page.goto('/en/login');
    await page.waitForLoadState('networkidle');

    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/en/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '03-dashboard-english.png'),
      fullPage: true,
    });
  });

  test('04 - Capture Dashboard (Arabic)', async ({ page }) => {
    // Login with Arabic interface
    await page.goto('/ar/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/ar/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '04-dashboard-arabic.png'),
      fullPage: true,
    });
  });

  test('05 - Capture Books/Catalog Page (English)', async ({ page }) => {
    // Login
    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/en/dashboard', { timeout: 10000 });

    // Navigate to books
    await page.goto('/en/books');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '05-books-catalog-english.png'),
      fullPage: true,
    });
  });

  test('06 - Capture Books/Catalog Page (Arabic)', async ({ page }) => {
    await page.goto('/ar/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/ar/dashboard', { timeout: 10000 });

    await page.goto('/ar/books');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '06-books-catalog-arabic.png'),
      fullPage: true,
    });
  });

  test('07 - Capture Circulation Page (English)', async ({ page }) => {
    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/en/dashboard', { timeout: 10000 });

    await page.goto('/en/circulation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '07-circulation-english.png'),
      fullPage: true,
    });
  });

  test('08 - Capture Circulation Page (Arabic)', async ({ page }) => {
    await page.goto('/ar/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/ar/dashboard', { timeout: 10000 });

    await page.goto('/ar/circulation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '08-circulation-arabic.png'),
      fullPage: true,
    });
  });

  test('09 - Capture Users Management (English)', async ({ page }) => {
    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/en/dashboard', { timeout: 10000 });

    await page.goto('/en/users');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '09-users-management-english.png'),
      fullPage: true,
    });
  });

  test('10 - Capture Users Management (Arabic)', async ({ page }) => {
    await page.goto('/ar/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/ar/dashboard', { timeout: 10000 });

    await page.goto('/ar/users');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '10-users-management-arabic.png'),
      fullPage: true,
    });
  });

  test('11 - Capture Reports Page (English)', async ({ page }) => {
    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/en/dashboard', { timeout: 10000 });

    await page.goto('/en/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '11-reports-english.png'),
      fullPage: true,
    });
  });

  test('12 - Capture Reports Page (Arabic)', async ({ page }) => {
    await page.goto('/ar/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/ar/dashboard', { timeout: 10000 });

    await page.goto('/ar/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '12-reports-arabic.png'),
      fullPage: true,
    });
  });

  test('13 - Capture Settings Page (English)', async ({ page }) => {
    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/en/dashboard', { timeout: 10000 });

    await page.goto('/en/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '13-settings-english.png'),
      fullPage: true,
    });
  });

  test('14 - Capture Settings Page (Arabic)', async ({ page }) => {
    await page.goto('/ar/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/ar/dashboard', { timeout: 10000 });

    await page.goto('/ar/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '14-settings-arabic.png'),
      fullPage: true,
    });
  });

  test('15 - Capture Mobile View - Dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X

    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/en/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '15-dashboard-mobile-english.png'),
      fullPage: true,
    });
  });

  test('16 - Capture Tablet View - Dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'admin@nawra.om');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/en/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '16-dashboard-tablet-english.png'),
      fullPage: true,
    });
  });
});
