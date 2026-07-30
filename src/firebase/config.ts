import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth as getFirebaseAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAwQzaSYFbxaIEnVvHco6gBLgZhbRk1tas",
  authDomain: "cogniva-001.firebaseapp.com",
  databaseURL: "https://cogniva-001-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cogniva-001",
  storageBucket: "cogniva-001.firebasestorage.app",
  messagingSenderId: "71189706367",
  appId: "1:71189706367:web:a85182182117e6d906bbb714a"
};

// initialize app
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// initialize auth
// Note: this uses default (in-memory) persistence, not AsyncStorage — on a
// real device, users will be logged out each time the app fully closes.
// If you want persistent login on native, swap this for initializeAuth +
// getReactNativePersistence(AsyncStorage) like the original version did.
export const auth = getFirebaseAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
