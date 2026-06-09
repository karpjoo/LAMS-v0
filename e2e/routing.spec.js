import { test, expect } from '@playwright/test';

test.describe('AuthGuard Routing Redirects', () => {

  test('AT-010: should redirect guest users to /login when accessing protected workspace route', async ({ page }) => {
    // Navigate directly to the protected workspace URL
    await page.goto('/workspace');

    // Assert that the page is redirected to /login immediately
    await expect(page).toHaveURL(/\/login/);

    // Verify the login panel contents
    const title = page.locator('h1');
    await expect(title).toHaveText('LAMS');
  });

  test('should redirect guest users to /login when accessing protected admin route', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect guest users to /login when accessing protected dashboard route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
