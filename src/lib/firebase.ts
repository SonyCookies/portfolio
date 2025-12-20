import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;
let db: Firestore | undefined;

if (typeof window !== 'undefined') {
  // Client-side
  try {
    if (!getApps().length) {
      // Check if config is complete
      if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
        console.log('[Firebase] Initialized successfully');
      } else {
        console.warn('[Firebase] Missing required config:', {
          hasApiKey: !!firebaseConfig.apiKey,
          hasProjectId: !!firebaseConfig.projectId,
          hasAuthDomain: !!firebaseConfig.authDomain,
        });
      }
    } else {
      app = getApps()[0];
      console.log('[Firebase] Using existing app instance');
    }
    if (app) {
      auth = getAuth(app);
      storage = getStorage(app);
      db = getFirestore(app);
      console.log('[Firebase] Services initialized:', { hasAuth: !!auth, hasStorage: !!storage, hasDb: !!db });
    }
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    console.error('[Firebase] Error details:', error instanceof Error ? error.message : String(error));
  }
} else {
  console.log('[Firebase] Server-side: Firebase not initialized (client-side only)');
}

export { app, auth, storage, db };
