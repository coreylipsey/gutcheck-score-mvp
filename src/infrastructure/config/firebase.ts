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

// Export based on environment
const { db, auth } = process.env.NODE_ENV === 'test' 
  ? createMockFirebase() 
  : createRealFirebase();

export { db, auth }; 