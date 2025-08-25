import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Create mock objects for test environment
const createMockFirebase = () => ({
  db: {} as any,
  auth: {} as any,
});

// Create real Firebase instances for non-test environment
const createRealFirebase = () => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  return {
    db: getFirestore(app),
    auth: getAuth(app),
  };
};

// Only initialize Firebase on the client side and not during build
let db: any = null;
let auth: any = null;

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  const firebaseInstance = createRealFirebase();
  db = firebaseInstance.db;
  auth = firebaseInstance.auth;
} else if (process.env.NODE_ENV === 'test') {
  const mockInstance = createMockFirebase();
  db = mockInstance.db;
  auth = mockInstance.auth;
}

export { db, auth }; 