import { test, expect } from '@playwright/test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { seedTestData } from './helpers/seed';

const PROJECT_ID = 'demo-lams-v0';

async function seedConversationsForConsensus() {
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: '127.0.0.1',
      port: 8080
    }
  });

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    
    // Seed call_consensus_1 (for mismatch testing)
    await setDoc(doc(adminDb, 'conversations', 'call_consensus_1'), {
      call_id: 'call_consensus_1',
      status: 'Round 1 Active',
      label_completion_count: 0,
      created_at: new Date(),
      turns: [
        { sequence_no: 1, speaker: 'customer', text: 'This is a sample sentence.' }
      ]
    });

    // Seed call_consensus_2 (for skip_round2 testing)
    await setDoc(doc(adminDb, 'conversations', 'call_consensus_2'), {
      call_id: 'call_consensus_2',
      status: 'Round 1 Active',
      label_completion_count: 0,
      created_at: new Date(),
      turns: [
        { sequence_no: 1, speaker: 'customer', text: 'Another test sentence.' }
      ]
    });

    // Seed call_consensus_3 (for auto-consensus matching testing)
    await setDoc(doc(adminDb, 'conversations', 'call_consensus_3'), {
      call_id: 'call_consensus_3',
      status: 'Round 1 Active',
      label_completion_count: 0,
      created_at: new Date(),
      turns: [
        { sequence_no: 1, speaker: 'customer', text: 'Consent testing sentence.' }
      ]
    });
  });

  await testEnv.cleanup();
}

async function loginUser(page, email, password) {
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/workspace|\/admin/);
}

test.describe('Expert Consensus Loop E2E Tests (AT-005, AT-006, AT-015)', () => {
  
  test.beforeAll(async () => {
    await seedTestData();
    await seedConversationsForConsensus();
  });

  test('AT-005: should prefill form on selecting evaluated conversation', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Log in as Evaluator 1
    await loginUser(page, 'evaluator1@lams.net', 'password123');
    await page.click('text=call_consensus_1');

    // 2. Submit Toxicity Present, Hate Speech, L1, "test evidence"
    await page.click('text=Present (유해)');
    await page.click('text=차별/비하 (Hate Speech)');
    await page.click('button:has-text("L1 - Low")');
    await page.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'test evidence');
    
    // Setup dialog listener for submit completion alert
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Evaluation saved successfully');
      await dialog.accept();
    });
    await page.click('#submit-evaluation-btn');

    // 3. Select call_consensus_2, then select call_consensus_1 again
    await page.click('text=call_consensus_2');
    await page.click('text=call_consensus_1');

    // 4. Verify inputs are prefilled correctly
    const presentRadio = page.locator('input[value="Present"]');
    await expect(presentRadio).toBeChecked();
    
    const hateRadio = page.locator('input[value="4"]'); // Hate speech category ID is 4
    await expect(hateRadio).toBeChecked();

    const evidenceInput = page.locator('input[placeholder="Evidence Phrase #1 (Required if Present)"]');
    await expect(evidenceInput).toHaveValue('test evidence');

    await context.close();
  });

  test('AT-015 (Part 1): should transition to Round 2 Active upon mismatch', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Evaluator 1 already submitted Toxicity Present
    // Let's submit Evaluator 2 as Toxicity Absent
    await loginUser(page1, 'evaluator2@lams.net', 'password123');
    await page1.click('text=call_consensus_1');
    
    // Toxicity is Absent by default, just submit
    page1.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Evaluation saved successfully');
      await dialog.accept();
    });
    await page1.click('#submit-evaluation-btn');

    // Submit Evaluator 3 as Toxicity Present, Sexual Harassment, L3, "harassment text"
    await loginUser(page2, 'evaluator3@lams.net', 'password123');
    await page2.click('text=call_consensus_1');

    await page2.click('text=Present (유해)');
    await page2.click('text=성희롱 (Sexual Harassment)');
    await page2.click('button:has-text("L3 - High")');
    await page2.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'harassment text');

    // This is the 3rd submission, so it will trigger the consensus solve
    // Since Evaluators 1 and 3 submitted Present (different categories) and Evaluator 2 submitted Absent, there is mismatch.
    // Parent conversation should transition to Round 2 Active
    page2.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Opinions mismatch! Transitioned to Round 2 Active');
      await dialog.accept();
    });
    await page2.click('#submit-evaluation-btn');

    // Wait and verify status tag in UI is updated to "Round 2 Active"
    await expect(page2.locator('text=Round 2 Active').first()).toBeVisible();

    // Verify Evaluator 3 can now see other evaluators' decisions (lifted blind spot)
    const otherAnnotationsHeader = page2.locator('text=이전 차수 평가 결과');
    await expect(otherAnnotationsHeader).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test('AT-015 (Part 2) & AT-006: should match 3 Present evaluations, transition status to Consensus Reached, and lock inputs', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();

    // We will submit identical evaluations for call_consensus_3 across 3 evaluators: Toxicity Present, Hate Speech (ID: 4), L1
    
    // Evaluator 1
    await loginUser(page1, 'evaluator1@lams.net', 'password123');
    await page1.click('text=call_consensus_3');
    await page1.click('text=Present (유해)');
    await page1.click('text=차별/비하 (Hate Speech)');
    await page1.click('button:has-text("L1 - Low")');
    await page1.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'toxic content');
    page1.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page1.click('#submit-evaluation-btn');

    // Evaluator 2
    await loginUser(page2, 'evaluator2@lams.net', 'password123');
    await page2.click('text=call_consensus_3');
    await page2.click('text=Present (유해)');
    await page2.click('text=차별/비하 (Hate Speech)');
    await page2.click('button:has-text("L1 - Low")');
    await page2.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'toxic content');
    page2.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page2.click('#submit-evaluation-btn');

    // Evaluator 3
    await loginUser(page3, 'evaluator3@lams.net', 'password123');
    await page3.click('text=call_consensus_3');
    await page3.click('text=Present (유해)');
    await page3.click('text=차별/비하 (Hate Speech)');
    await page3.click('button:has-text("L1 - Low")');
    await page3.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'toxic content');
    
    // 3rd evaluator submit should trigger automatic consensus match and save gold standard
    page3.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Consensus reached! Gold standard saved automatically');
      await dialog.accept();
    });
    await page3.click('#submit-evaluation-btn');

    // Expect status tag to transition to "Consensus Reached"
    await expect(page3.locator('text=Consensus Reached').first()).toBeVisible();

    // Verify form is locked
    const submitBtn = page3.locator('#submit-evaluation-btn');
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn).toHaveText('Evaluation Locked');

    await context1.close();
    await context2.close();
    await context3.close();
  });

  test('should verify Admin skip_round2 settings configuration and direct Round 3 escalation', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const pageAdmin = await adminContext.newPage();

    // 1. Admin logs in and checks "skip_round2"
    await loginUser(pageAdmin, 'admin@lams.net', 'password123');
    await pageAdmin.goto('/admin');
    
    const skipCheckbox = pageAdmin.locator('#skip-round2-checkbox');
    await expect(skipCheckbox).not.toBeChecked();
    
    // Check it
    await skipCheckbox.check();
    await expect(skipCheckbox).toBeChecked();
    await expect(pageAdmin.locator('text=Settings saved successfully!')).toBeVisible();
    await adminContext.close();

    // 2. Evaluators submit mismatched evaluations for call_consensus_2
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    
    const p1 = await context1.newPage();
    const p2 = await context2.newPage();
    const p3 = await context3.newPage();

    // Evaluator 1 submits Present, Threat (ID: 3)
    await loginUser(p1, 'evaluator1@lams.net', 'password123');
    await p1.click('text=call_consensus_2');
    await p1.click('text=Present (유해)');
    await p1.click('text=위협 (Threat)');
    await p1.click('button:has-text("L2 - Medium")');
    await p1.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'threat statement');
    p1.once('dialog', async dialog => { await dialog.accept(); });
    await p1.click('#submit-evaluation-btn');

    // Evaluator 2 submits Absent
    await loginUser(p2, 'evaluator2@lams.net', 'password123');
    await p2.click('text=call_consensus_2');
    p2.once('dialog', async dialog => { await dialog.accept(); });
    await p2.click('#submit-evaluation-btn');

    // Evaluator 3 submits Present, Abuse (ID: 1)
    await loginUser(p3, 'evaluator3@lams.net', 'password123');
    await p3.click('text=call_consensus_2');
    await p3.click('text=Present (유해)');
    await p3.click('text=폭언/욕설 (Abusive / Insult)');
    await p3.click('button:has-text("L2 - Medium")');
    await p3.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'abusive statement');

    // Since skip_round2 was enabled by Admin, it should directly transition to Round 3 Active
    p3.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Opinions mismatch! Transitioned to Round 3 Active');
      await dialog.accept();
    });
    await p3.click('#submit-evaluation-btn');

    // Verify status tag in UI is updated to "Round 3 Active"
    await expect(p3.locator('text=Round 3 Active').first()).toBeVisible();

    await context1.close();
    await context2.close();
    await context3.close();
  });

  test('should allow designated Adjudicator to submit final verdict in Round 3 Active', async ({ page }) => {
    // Log in as Adjudicator
    await loginUser(page, 'adjudicator@lams.net', 'password123');
    await page.click('text=call_consensus_2');

    // Expect Adjudicator banner to be visible
    await expect(page.locator('text=Adjudicator Mode Active')).toBeVisible();

    // Submit the final consensus decision: Present, Hate Speech (ID: 4), L3
    await page.click('text=Present (유해)');
    await page.click('text=차별/비하 (Hate Speech)');
    await page.click('button:has-text("L3 - High")');
    await page.fill('input[placeholder="Evidence Phrase #1 (Required if Present)"]', 'final adjudicator verdict');

    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Adjudication verdict saved successfully');
      await dialog.accept();
    });
    await page.click('#submit-evaluation-btn');

    // Wait and verify status is Consensus Reached
    await expect(page.locator('text=Consensus Reached').first()).toBeVisible();
    await expect(page.locator('#submit-evaluation-btn')).toBeDisabled();
  });
});
