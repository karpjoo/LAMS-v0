import { test, expect } from '@playwright/test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { seedTestData } from './helpers/seed';

const PROJECT_ID = 'demo-lams-v0';

async function seedConversationsForWorkspace() {
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: '127.0.0.1',
      port: 8080
    }
  });

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    
    // Seed an active conversation with mixed sequence turns to test sorting
    await setDoc(doc(adminDb, 'conversations', 'call_sort_test'), {
      call_id: 'call_sort_test',
      status: 'Round 1 Active',
      label_completion_count: 0,
      created_at: new Date(),
      turns: [
        // Out-of-order sequence insertion in DB
        { sequence_no: 2, speaker: 'agent', text: 'This is the agent speaking second.' },
        { sequence_no: 1, speaker: 'customer', text: 'This is the customer speaking first.' }
      ]
    });
  });

  await testEnv.cleanup();
}

test.describe('Evaluator Workspace interface validations', () => {

  test.beforeAll(async () => {
    await seedTestData();
    await seedConversationsForWorkspace();
  });

  test.beforeEach(async ({ page }) => {
    // Log in as Evaluator
    await page.goto('/login');
    await page.fill('#email', 'evaluator@lams.net');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/workspace/);
  });

  test('AT-004: should list conversations, select one, sort turns chronologically, and verify alignment styles', async ({ page }) => {
    // 1. Check sidebar list renders seeded item
    const sidebarItem = page.locator('text=call_sort_test');
    await expect(sidebarItem).toBeVisible();

    // 2. Click the conversation to load detailed turns
    await sidebarItem.click();

    // Expect header text update
    await expect(page.locator('h3:has-text("call_sort_test")')).toBeVisible();

    // 3. Verify turns are sorted chronologically (Turn #1 before Turn #2)
    // Find all turn containers inside the turns stream
    const turnBubbles = page.locator('#dialogue-turns-container > div');
    await expect(turnBubbles).toHaveCount(2);

    const firstBubbleText = await turnBubbles.nth(0).innerText();
    const secondBubbleText = await turnBubbles.nth(1).innerText();

    // Assert sequence order sorting in UI
    expect(firstBubbleText).toContain('Turn #1');
    expect(firstBubbleText).toContain('This is the customer speaking first.');

    expect(secondBubbleText).toContain('Turn #2');
    expect(secondBubbleText).toContain('This is the agent speaking second.');

    // 4. Verify float layouts (flex alignment)
    // Customer bubble should have justify-content = flex-start
    const customerAlign = await turnBubbles.nth(0).evaluate((node) => window.getComputedStyle(node).justifyContent);
    expect(customerAlign).toBe('flex-start');

    // Agent bubble should have justify-content = flex-end
    const agentAlign = await turnBubbles.nth(1).evaluate((node) => window.getComputedStyle(node).justifyContent);
    expect(agentAlign).toBe('flex-end');
  });

  test('should verify toxicity form element states and conditional completeness', async ({ page }) => {
    // Select the conversation
    await page.click('text=call_sort_test');

    // Initially toxicity is Absent, expect submit button to be enabled
    const submitBtn = page.locator('#submit-evaluation-btn');
    await expect(submitBtn).toBeEnabled();

    // Switch to Toxicity Present
    await page.click('text=Present (유해)');

    // Now submit button should be disabled due to incomplete category, risk, and evidence inputs
    await expect(submitBtn).toBeDisabled();

    // Select category (Hate Speech)
    await page.click('text=차별/비하 (Hate Speech)');
    await expect(submitBtn).toBeDisabled(); // still disabled

    // Select risk level L2
    await page.click('button:has-text("L2 - Medium")');
    await expect(submitBtn).toBeDisabled(); // still disabled

    // Fill evidence phrase
    await page.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'discriminatory text');
    
    // Now form is complete, expect submit to become active
    await expect(submitBtn).toBeEnabled();
  });
});
