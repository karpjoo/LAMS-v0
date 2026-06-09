import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Admin Ingestion and Deletion flow', () => {

  test.beforeEach(async ({ page }) => {
    // Perform login as Admin before each test in this suite
    await page.goto('/login');
    await page.fill('#email', 'admin@lams.net');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Assert redirect to /admin
    await expect(page).toHaveURL(/\/admin/);
  });

  test('AT-001 & AT-011: should upload clean and dirty datasets verifying PII triggers', async ({ page }) => {
    // 1. Upload clean dataset
    const cleanFilePath = path.join(__dirname, 'fixtures', 'dataset_clean.json');
    
    // Set file input values
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('p:has-text("dataset JSON file")').click()
    ]);
    await fileChooser.setFiles(cleanFilePath);

    // Expect summary info to render
    await expect(page.locator('text=Parsed 1 records')).toBeVisible();
    await expect(page.locator('text=PII warnings flagged: 0')).toBeVisible();

    // Commit upload
    await page.click('#upload-submit-btn');

    // Verify successful upload banners
    await expect(page.locator('text=Dataset upload complete! Successfully loaded 1 records.')).toBeVisible();

    // Verify audit logs show the action
    await expect(page.locator('text=Imported dataset containing 1 conversation records.').first()).toBeVisible();

    // 2. Upload PII dirty dataset
    const dirtyFilePath = path.join(__dirname, 'fixtures', 'dataset_pii_dirty.json');
    const [fileChooser2] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('p:has-text("dataset JSON file")').click()
    ]);
    await fileChooser2.setFiles(dirtyFilePath);

    await expect(page.locator('text=Parsed 1 records')).toBeVisible();
    await expect(page.locator('text=PII warnings flagged: 1')).toBeVisible();

    // Try committing
    await page.click('#upload-submit-btn');

    // Expect PII Warning Modal to pop up
    await expect(page.locator('text=PII Risk Warning')).toBeVisible();
    await expect(page.locator('text=010-9876-5432')).toBeVisible();
    await expect(page.locator('text=01011112222')).toBeVisible();

    // Test Cancel button inside modal
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text=PII Risk Warning')).not.toBeVisible();

    // Submit again and Confirm upload
    await page.click('#upload-submit-btn');
    await page.click('button:has-text("Confirm & Upload")');

    // Expect success message
    await expect(page.locator('text=Dataset upload complete! Successfully loaded 1 records.')).toBeVisible();
  });

  test('AT-003: should verify delete interlock confirm requirements and clean dataset', async ({ page }) => {
    // 1. Trigger deletion modal
    await page.click('#delete-dataset-btn');
    await expect(page.locator('text=Irreversible Deletion Safety check')).toBeVisible();

    // Verify Confirm button is disabled
    const confirmBtn = page.locator('#confirm-delete-button');
    await expect(confirmBtn).toBeDisabled();

    // 2. Fill incorrect confirmation text
    await page.fill('#confirm-delete-text', 'DELETE ALL');
    await expect(confirmBtn).toBeDisabled();

    // 3. Fill correct validation phrase
    await page.fill('#confirm-delete-text', 'DELETE ALL DATASET');
    await expect(confirmBtn).toBeEnabled();

    // Click Delete and verify success
    await confirmBtn.click();
    await expect(page.locator('text=Database cleared successfully!')).toBeVisible();

    // Check system audit log updates
    await expect(page.locator('text=Cleared all conversations, evaluators labels, llm results, and gold standards.').first()).toBeVisible();
  });
});
