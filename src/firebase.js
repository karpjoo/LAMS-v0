import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "demo-api-key-lams-v0",
  authDomain: "demo-lams-v0.firebaseapp.com",
  projectId: "demo-lams-v0",
  storageBucket: "demo-lams-v0.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if running in browser localhost or in testing environment (Vitest)
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.port === '5173'
);
const isTestEnv = typeof process !== 'undefined' && process.env && (
  process.env.VITEST === 'true' || 
  process.env.NODE_ENV === 'test'
);

if (isLocalhost || isTestEnv) {
  try {
    // Avoid double connections in HMR or multiple test executions
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log("Firebase Emulators initialized: Auth (9099), Firestore (8080)");
    }
  } catch (err) {
    console.warn("Firebase Emulator connection warning:", err.message);
  }
}

export { auth, db };
