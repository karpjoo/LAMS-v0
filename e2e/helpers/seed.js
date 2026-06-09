import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';

const PROJECT_ID = 'demo-lams-v0';

async function clearAuthEmulator() {
  const url = `http://127.0.0.1:9099/emulator/v1/projects/${PROJECT_ID}/accounts`;
  try {
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) {
      console.log("Successfully cleared local Auth Emulator accounts.");
    } else {
      console.warn("Auth Emulator clear returned non-OK status:", res.status);
    }
  } catch (err) {
    console.warn("Failed to contact Auth Emulator for clearing:", err.message);
  }
}

async function registerAuthUser(email, password) {
  const url = `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key-lams-v0`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'gcloud-project': PROJECT_ID
    },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(`Failed to create Auth user: ${JSON.stringify(errData)}`);
  }

  const data = await response.json();
  return data.localId; // localId is the firebase UID
}

export async function seedTestData() {
  console.log("Seeding E2E test data inside emulators...");

  // 1. Clear pre-existing Auth records
  await clearAuthEmulator();

  // 2. Create Auth accounts and get fresh UIDs
  const adminUid = await registerAuthUser('admin@lams.net', 'password123');
  const evalUid = await registerAuthUser('evaluator@lams.net', 'password123');
  const eval1Uid = await registerAuthUser('evaluator1@lams.net', 'password123');
  const eval2Uid = await registerAuthUser('evaluator2@lams.net', 'password123');
  const eval3Uid = await registerAuthUser('evaluator3@lams.net', 'password123');
  const adjUid = await registerAuthUser('adjudicator@lams.net', 'password123');

  // 3. Set Firestore profile docs with rules disabled
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: '127.0.0.1',
      port: 8080
    }
  });

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    
    // Admin profile
    await setDoc(doc(adminDb, 'users', adminUid), {
      uid: adminUid,
      email: 'admin@lams.net',
      role: 'Admin',
      is_adjudicator: false,
      created_at: new Date()
    });

    // Evaluator profiles
    await setDoc(doc(adminDb, 'users', evalUid), {
      uid: evalUid,
      email: 'evaluator@lams.net',
      role: 'Evaluator',
      is_adjudicator: false,
      created_at: new Date()
    });

    await setDoc(doc(adminDb, 'users', eval1Uid), {
      uid: eval1Uid,
      email: 'evaluator1@lams.net',
      role: 'Evaluator',
      is_adjudicator: false,
      created_at: new Date()
    });

    await setDoc(doc(adminDb, 'users', eval2Uid), {
      uid: eval2Uid,
      email: 'evaluator2@lams.net',
      role: 'Evaluator',
      is_adjudicator: false,
      created_at: new Date()
    });

    await setDoc(doc(adminDb, 'users', eval3Uid), {
      uid: eval3Uid,
      email: 'evaluator3@lams.net',
      role: 'Evaluator',
      is_adjudicator: false,
      created_at: new Date()
    });

    // Adjudicator profile
    await setDoc(doc(adminDb, 'users', adjUid), {
      uid: adjUid,
      email: 'adjudicator@lams.net',
      role: 'Evaluator',
      is_adjudicator: true,
      created_at: new Date()
    });

    console.log(`Seeded users profiles in Firestore: Admin (uid: ${adminUid}), Evaluators (uid: ${evalUid}, ${eval1Uid}, ${eval2Uid}, ${eval3Uid}), Adjudicator (uid: ${adjUid})`);
  });

  await testEnv.cleanup();
}
