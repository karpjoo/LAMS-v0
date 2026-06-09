import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { setDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

let testEnv;
const PROJECT_ID = 'demo-lams-v0';

beforeAll(async () => {
  const rules = readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8');
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080
    }
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

// Helper to write mock profile documents with rules disabled
async function seedUserProfile(uid, role, isAdjudicator = false) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, 'users', uid), {
      uid,
      email: `${uid}@lams.net`,
      role: role,
      is_adjudicator: isAdjudicator,
      created_at: new Date()
    });
  });
}

// Helper to write mock conversation documents with rules disabled
async function seedConversation(callId, status) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, 'conversations', callId), {
      call_id: callId,
      status: status,
      label_completion_count: 0,
      turns: [],
      created_at: new Date()
    });
  });
}

// Helper to seed a label document with rules disabled
async function seedLabel(callId, labelId, userId, toxicity) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await setDoc(doc(adminDb, `conversations/${callId}/labels/${labelId}`), {
      call_id: callId,
      user_id: userId,
      round_no: 1,
      toxicity: toxicity,
      category_id: null,
      risk_level: null,
      evidence_phrases: [],
      submitted_at: new Date()
    });
  });
}

describe('Firestore Security Rules Unit Tests', () => {

  it('DSR-001 (Part 1): should block unauthenticated users from reading conversations', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, 'conversations', 'call_0001');
    await assertFails(getDoc(docRef));
  });

  it('DSR-001 (Part 2): should allow authenticated users to read conversations', async () => {
    await seedConversation('call_0001', 'Round 1 Active');
    const authedDb = testEnv.authenticatedContext('evaluator_1').firestore();
    const docRef = doc(authedDb, 'conversations', 'call_0001');
    await assertSucceeds(getDoc(docRef));
  });

  it('DSR-001 (Part 3): should block general Evaluators from writing conversations', async () => {
    await seedUserProfile('evaluator_1', 'Evaluator');
    const db = testEnv.authenticatedContext('evaluator_1').firestore();
    const docRef = doc(db, 'conversations', 'call_0001');
    await assertFails(setDoc(docRef, { status: 'Round 1 Active' }));
  });

  it('DSR-001 (Part 4): should allow Admin role to write conversations', async () => {
    await seedUserProfile('admin_1', 'Admin');
    const db = testEnv.authenticatedContext('admin_1').firestore();
    const docRef = doc(db, 'conversations', 'call_0001');
    await assertSucceeds(setDoc(docRef, { 
      call_id: 'call_0001',
      status: 'Round 1 Active',
      turns: [] 
    }));
  });

  it('DSR-004 (Part 1): should allow authenticated users to write append-only audit logs', async () => {
    const db = testEnv.authenticatedContext('evaluator_1').firestore();
    const logRef = doc(db, 'audit_logs', 'log_123');
    await assertSucceeds(setDoc(logRef, {
      log_id: 'log_123',
      actor_id: 'evaluator_1',
      action_type: 'Save Evaluator Label',
      timestamp: new Date()
    }));
  });

  it('DSR-004 (Part 2): should prevent updating or deleting audit logs even for Admin', async () => {
    await seedUserProfile('admin_1', 'Admin');
    
    // Seed audit log
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'audit_logs', 'log_123'), { log_id: 'log_123' });
    });

    const db = testEnv.authenticatedContext('admin_1').firestore();
    const logRef = doc(db, 'audit_logs', 'log_123');
    
    await assertFails(updateDoc(logRef, { action_type: 'Modified' }));
    await assertFails(deleteDoc(logRef));
  });

  it('DSR-004 (Part 3): should prevent Evaluators from reading audit logs', async () => {
    await seedUserProfile('evaluator_1', 'Evaluator');
    const db = testEnv.authenticatedContext('evaluator_1').firestore();
    const logRef = doc(db, 'audit_logs', 'log_123');
    await assertFails(getDoc(logRef));
  });

  it('DSR-004 (Part 4): should allow Admin to read audit logs', async () => {
    await seedUserProfile('admin_1', 'Admin');
    const db = testEnv.authenticatedContext('admin_1').firestore();
    const logRef = doc(db, 'audit_logs', 'log_123');
    await assertSucceeds(getDoc(logRef));
  });

  it('DSR-002 (Part 1): should allow user to write label document mapping their own UID', async () => {
    await seedConversation('call_0001', 'Round 1 Active');
    const db = testEnv.authenticatedContext('evaluator_1').firestore();
    const labelRef = doc(db, 'conversations/call_0001/labels/evaluator_1_1');
    await assertSucceeds(setDoc(labelRef, {
      call_id: 'call_0001',
      user_id: 'evaluator_1',
      round_no: 1,
      toxicity: 'Absent',
      category_id: null,
      risk_level: null,
      evidence_phrases: [],
      submitted_at: new Date()
    }));
  });

  it('DSR-002 (Part 2): should block user from writing labels for another UID', async () => {
    await seedConversation('call_0001', 'Round 1 Active');
    const db = testEnv.authenticatedContext('evaluator_2').firestore();
    const labelRef = doc(db, 'conversations/call_0001/labels/evaluator_1_1');
    await assertFails(setDoc(labelRef, {
      call_id: 'call_0001',
      user_id: 'evaluator_1',
      round_no: 1,
      toxicity: 'Absent',
      category_id: null,
      risk_level: null,
      evidence_phrases: [],
      submitted_at: new Date()
    }));
  });

  it('DSR-002 (Part 3): should block writing labels if conversation is locked (Consensus Reached)', async () => {
    await seedConversation('call_0001', 'Consensus Reached');
    const db = testEnv.authenticatedContext('evaluator_1').firestore();
    const labelRef = doc(db, 'conversations/call_0001/labels/evaluator_1_1');
    await assertFails(setDoc(labelRef, {
      call_id: 'call_0001',
      user_id: 'evaluator_1',
      round_no: 1,
      toxicity: 'Absent',
      category_id: null,
      risk_level: null,
      evidence_phrases: [],
      submitted_at: new Date()
    }));
  });

  it('DSR-002 (Part 4) - Round 1 Blind Spot: should block evaluators from reading others labels during active Round 1', async () => {
    await seedConversation('call_0001', 'Round 1 Active');
    await seedLabel('call_0001', 'evaluator_1_1', 'evaluator_1', 'Present');

    const db = testEnv.authenticatedContext('evaluator_2').firestore();
    const labelRef = doc(db, 'conversations/call_0001/labels/evaluator_1_1');
    await assertFails(getDoc(labelRef));
  });

  it('DSR-002 (Part 5): should allow evaluators to read others labels when Round 1 is complete (status not Round 1 Active)', async () => {
    await seedConversation('call_0001', 'Round 2 Active');
    await seedLabel('call_0001', 'evaluator_1_1', 'evaluator_1', 'Present');

    const db = testEnv.authenticatedContext('evaluator_2').firestore();
    const labelRef = doc(db, 'conversations/call_0001/labels/evaluator_1_1');
    await assertSucceeds(getDoc(labelRef));
  });

  it('DSR-003 (Part 1): should allow Adjudicator to write gold standard verdict', async () => {
    await seedUserProfile('adjudicator_1', 'Evaluator', true);
    await seedConversation('call_0001', 'Round 3 Active');
    
    const db = testEnv.authenticatedContext('adjudicator_1').firestore();
    const verdictRef = doc(db, 'conversations/call_0001/gold_standard/verdict');
    await assertSucceeds(setDoc(verdictRef, {
      call_id: 'call_0001',
      toxicity: 'Present',
      category_id: 2,
      risk_level: 3,
      evidence_phrases: ['bad word'],
      finalized_at: new Date(),
      determined_by: 'adjudicator',
      adjudicator_id: 'adjudicator_1'
    }));
  });

  it('DSR-003 (Part 2): should deny normal Evaluator from writing gold standard verdict', async () => {
    await seedUserProfile('evaluator_1', 'Evaluator', false);
    await seedConversation('call_0001', 'Round 3 Active');
    
    const db = testEnv.authenticatedContext('evaluator_1').firestore();
    const verdictRef = doc(db, 'conversations/call_0001/gold_standard/verdict');
    await assertFails(setDoc(verdictRef, {
      call_id: 'call_0001',
      toxicity: 'Present'
    }));
  });
});
