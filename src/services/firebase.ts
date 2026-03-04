// ============================================
// Petit Stay - Firebase Configuration
// Real Firebase Integration
// ============================================

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth = { currentUser: null } as unknown as Auth;
let db: Firestore = {} as unknown as Firestore;
let storage: FirebaseStorage = {} as unknown as FirebaseStorage;
let functions: Functions = {} as unknown as Functions;

if (firebaseConfig.apiKey) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        functions = getFunctions(app);

        // Connect to emulators in development (optional)
        if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
            connectAuthEmulator(auth, 'http://localhost:9099');
            connectFirestoreEmulator(db, 'localhost', 8080);
            connectStorageEmulator(storage, 'localhost', 9199);
            connectFunctionsEmulator(functions, 'localhost', 5001);
        }

        // Load Analytics only in production
        if (import.meta.env.PROD && typeof window !== 'undefined' && firebaseConfig.measurementId) {
            import('firebase/analytics').then(({ getAnalytics }) => {
                getAnalytics(app);
            }).catch(() => {
                // Analytics is optional - silently ignore failures
            });
        }
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
        auth = { currentUser: null } as unknown as Auth;
        db = {} as unknown as Firestore;
        storage = {} as unknown as FirebaseStorage;
        functions = {} as unknown as Functions;
    }
} else {
    console.warn('Firebase configuration missing. Using mock services.');
    auth = { currentUser: null } as unknown as Auth;
    db = {} as unknown as Firestore;
    storage = {} as unknown as FirebaseStorage;
    functions = {} as unknown as Functions;
}

export { auth, db, storage, functions };
export default app;
