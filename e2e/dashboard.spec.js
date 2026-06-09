import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedTestData } from './helpers/seed';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Dashboard and Ingestion Integration Flow', () => {
  test.beforeEach(async () => {
    // Seed fresh users
    await seedTestData();
  });

  test('should verify empty state, failed prediction upload (missing call_id), successful dataset upload, stats upload, and dashboard rendering', async ({ page }) => {
    // 1. Log in as Admin
    await page.goto('/login');
    await page.fill('#email', 'admin@lams.net');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // 2. Clear any pre-existing database records to start fresh
    await page.click('#delete-dataset-btn');
    await page.fill('#confirm-delete-text', 'DELETE ALL DATASET');
    await page.click('#confirm-delete-button');
    await expect(page.locator('text=Database cleared successfully!')).toBeVisible();

    // 3. Go to Dashboard and verify empty statistics message
    await page.click('button:has-text("Dashboard")');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=No precalculated model agreement statistics loaded')).toBeVisible();

    // 4. Return to Admin and try uploading LLM predictions first (which should fail due to missing call_id)
    await page.click('button:has-text("Admin Panel")');
    await expect(page).toHaveURL(/\/admin/);

    const predictionsFilePath = path.join(__dirname, 'fixtures', 'llm_predictions_test.json');
    const [llmChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('p:has-text("predictions JSON file")').click()
    ]);
    await llmChooser.setFiles(predictionsFilePath);

    await expect(page.locator('text=File Ready: LLM Predictions')).toBeVisible();
    await page.click('#upload-llm-btn');

    // Should fail and display call_id missing warning
    await expect(page.locator('text=The following call_ids do not exist in the database: call_clean_0001')).toBeVisible();

    // 5. Upload Dataset conversations to satisfy validation constraints
    const datasetFilePath = path.join(__dirname, 'fixtures', 'dataset_clean.json');
    const [datasetChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('p:has-text("dataset JSON file")').click()
    ]);
    await datasetChooser.setFiles(datasetFilePath);

    await expect(page.locator('text=Parsed 1 records')).toBeVisible();
    await page.click('#upload-submit-btn');
    await expect(page.locator('text=Dataset upload complete!')).toBeVisible();

    // 6. Retry uploading LLM predictions (should succeed now)
    const [llmChooser2] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('p:has-text("predictions JSON file")').click()
    ]);
    await llmChooser2.setFiles(predictionsFilePath);
    await page.click('#upload-llm-btn');
    await expect(page.locator('text=LLM predictions upload complete!')).toBeVisible();

    // 7. Upload Statistics metrics
    const statsFilePath = path.join(__dirname, 'fixtures', 'stats_test.json');
    const [statsChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('p:has-text("statistics JSON file")').click()
    ]);
    await statsChooser.setFiles(statsFilePath);
    await page.click('#upload-stats-btn');
    await expect(page.locator('text=Statistics metrics upload complete!')).toBeVisible();

    // 8. Go to Dashboard and verify rendering
    await page.click('button:has-text("Dashboard")');
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify progress counts
    await expect(page.locator('text=TOTAL DATASET')).toBeVisible();
    await expect(page.locator('#metric-total-dataset')).toHaveText('1');

    // Verify statistics dial charts render values
    await expect(page.locator('text=Model-to-Model Agreement')).toBeVisible();
    await expect(page.locator('text=Human Evaluators Agreement')).toBeVisible();
    await expect(page.locator('span:has-text("0.72")')).toBeVisible();
    await expect(page.locator('span:has-text("0.81")')).toBeVisible();

    // Verify classification F1 accuracy chart elements exist
    await expect(page.locator('text=Model F1 Classification Accuracy')).toBeVisible();
    await expect(page.locator('text=GPT-4')).toBeVisible();
    await expect(page.locator('text=Gemini 1.5')).toBeVisible();
    await expect(page.locator('text=Claude 3')).toBeVisible();
    await expect(page.locator('text=0.85')).toBeVisible();
    await expect(page.locator('text=0.78')).toBeVisible();
    await expect(page.locator('text=0.82')).toBeVisible();
  });
});
