import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

if (!getApps().length) {
  // Initialize Firebase Admin
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      const serviceAccount = typeof serviceAccountKey === 'string' 
        ? JSON.parse(serviceAccountKey) 
        : serviceAccountKey;

      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      adminAuth = getAuth(app);
      adminDb = getFirestore(app);
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else {
  app = getApps()[0];
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
}

export { app, adminAuth, adminDb };
