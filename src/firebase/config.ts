import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth as getFirebaseAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const env = (process.env as Record<string, string | undefined>);

const requiredEnv = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
} as const;

const missing = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => `EXPO_PUBLIC_FIREBASE_${key}`);

if (missing.length) {
  throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}. Add them to your local .env file.`);
}

const firebaseConfig = {
  apiKey: requiredEnv.apiKey!,
  authDomain: requiredEnv.authDomain!,
  databaseURL: requiredEnv.databaseURL!,
  projectId: requiredEnv.projectId!,
  storageBucket: requiredEnv.storageBucket!,
  messagingSenderId: requiredEnv.messagingSenderId!,
  appId: requiredEnv.appId!,
};

// initialize app
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getFirebaseAuth(app);

export const db = getFirestore(app);
export const functions = getFunctions(app);
