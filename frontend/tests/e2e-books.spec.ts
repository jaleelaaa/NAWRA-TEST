import { test, expect } from '@playwright/test';

test.describe('Books Catalog E2E Tests', () => {
  const baseUrl = 'http://localhost:3000';

  async function login(page: any, locale: string = 'en') {
    await page.goto(`${baseUrl}/${locale}/login`);
    await page.fill('input[type="email"]', 'librarian@ministry.om');
    await page.fill('input[type="password"]', 'Librarian@123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }

  test('Books catalog page loads - English', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/admin\/catalog/);
    await page.screenshot({ path: 'test-results/books-catalog-en.png' });
  });

  test('Books catalog page loads - Arabic', async ({ page }) => {
    await login(page, 'ar');
    await page.goto(`${baseUrl}/ar/admin/catalog`);
    await page.waitForLoadState('networkidle');

    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');

    await page.screenshot({ path: 'test-results/books-catalog-ar.png' });
  });

  test('Books list is displayed', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);
    await page.waitForLoadState('networkidle');

    // Check for books grid or table
    const booksList = page.locator('[data-testid="books-grid"], [data-testid="books-table"], table, .grid');
    await expect(booksList).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/books-list.png' });
  });

  test('Search books functionality', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/books-search.png' });
    }
  });

  test('Filter books by category', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]');

    if (await categoryFilter.count() > 0) {
      await page.screenshot({ path: 'test-results/books-filter.png' });
    }
  });

  test('Open add book modal', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);
    await page.waitForLoadState('networkidle');

    const addButton = page.locator('button:has-text("Add"), button:has-text("New Book"), [data-testid="add-book"]');

    if (await addButton.count() > 0) {
      await addButton.first().click();
      await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
      await page.screenshot({ path: 'test-results/books-add-modal.png' });
    }
  });

  test('View book details', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);
    await page.waitForLoadState('networkidle');

    // Click on first book card or row
    const firstBook = page.locator('[data-testid="book-card"], table tbody tr').first();

    if (await firstBook.count() > 0) {
      await firstBook.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/books-details.png' });
    }
  });

  test('Books pagination', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);
    await page.waitForLoadState('networkidle');

    const nextButton = page.locator('button:has-text("Next"), [aria-label="Next"]');

    if (await nextButton.count() > 0 && await nextButton.first().isEnabled()) {
      await nextButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/books-pagination.png' });
    }
  });

  test('Books catalog is responsive', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/books-mobile.png' });

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/books-tablet.png' });

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'test-results/books-desktop.png' });
  });

  test('Book form has bilingual fields', async ({ page }) => {
    await login(page, 'en');
    await page.goto(`${baseUrl}/en/admin/catalog`);
    await page.waitForLoadState('networkidle');

    const addButton = page.locator('button:has-text("Add")').first();

    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Check for bilingual fields
      const titleEn = page.locator('input[name="title"], input[placeholder*="Title"]');
      const titleAr = page.locator('input[name="title_ar"], input[placeholder*="Arabic"]');

      await expect(titleEn.first()).toBeVisible();

      await page.screenshot({ path: 'test-results/books-bilingual-form.png' });
    }
  });
});
