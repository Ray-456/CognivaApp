import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
  reload,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db } from './config';

export type Role = 'Parent' | 'Therapist' | 'Psychologist';

export type Profile = {
  uid: string;
  name: string;
  email: string;
  role: Role;
  photoURL?: string | null;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  emailVerified: boolean;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<void>;
  hasChildProfile: boolean;
  markHasChildProfile: () => void;
  updateProfilePhoto: (url: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  // Google sign-in: signs into Firebase with the ID token from the OAuth
  // round-trip. If it's a brand-new user, `profile` stays null afterward —
  // that's what tells RootNavigator to show CompleteProfileScreen, since
  // Google never tells us whether someone is a Parent or a Professional.
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  // Used by CompleteProfileScreen to finish setting up a new Google account.
  finishProfileSetup: (name: string, role: Role) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChildProfile, setHasChildProfile] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setEmailVerified(!!firebaseUser?.emailVerified);

      try {
        if (firebaseUser) {
          await firebaseUser.getIdToken(true);
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const loadedProfile = snap.exists() ? (snap.data() as Profile) : null;
          setProfile(loadedProfile);

          if (loadedProfile?.role === 'Parent') {
            const childrenQuery = query(collection(db, 'users', firebaseUser.uid, 'children'), limit(1));
            const childrenSnap = await getDocs(childrenQuery);
            setHasChildProfile(!childrenSnap.empty);
          } else {
            setHasChildProfile(true);
          }
        } else {
          setProfile(null);
          setHasChildProfile(true);
        }
      } catch (error) {
        console.error('Unable to load the signed-in user profile.', {
          code: (error as { code?: string })?.code,
          message: (error as { message?: string })?.message,
          uid: firebaseUser?.uid,
        });
        setProfile(null);
        setHasChildProfile(true);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signUp = async (name: string, email: string, password: string, role: Role) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile: Profile = { uid: cred.user.uid, name, email, role };
    await setDoc(doc(db, 'users', cred.user.uid), { ...newProfile, createdAt: serverTimestamp() });
    setProfile(newProfile);
    setHasChildProfile(role !== 'Parent' ? true : false);
    await sendEmailVerification(cred.user);
    setEmailVerified(false);
  };

  const logIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => firebaseSignOut(auth);

  const markHasChildProfile = () => setHasChildProfile(true);

  const updateProfilePhoto = async (url: string) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), { photoURL: url }, { merge: true });
    setProfile((prev) => (prev ? { ...prev, photoURL: url } : prev));
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  const refreshVerificationStatus = async () => {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    setEmailVerified(!!auth.currentUser.emailVerified);
    setUser(auth.currentUser);
  };

  const signInWithGoogleIdToken = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    // onAuthStateChanged fires from this and loads `profile` from Firestore.
    // For a first-time Google user there's no users/{uid} doc yet, so
    // `profile` will resolve to null — that's the signal RootNavigator uses
    // to route to CompleteProfileScreen. Nothing else to do here.
  };

  const finishProfileSetup = async (name: string, role: Role) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    await currentUser.getIdToken(true);
    const newProfile: Profile = {
      uid: currentUser.uid,
      name,
      email: currentUser.email ?? '',
      role,
      photoURL: currentUser.photoURL ?? null,
    };
    await setDoc(doc(db, 'users', currentUser.uid), { ...newProfile, createdAt: serverTimestamp() });
    setProfile(newProfile);
    setHasChildProfile(role !== 'Parent');
  };

  return (
    <AuthContext.Provider
      value={{
        user, profile, loading, emailVerified, resendVerificationEmail, refreshVerificationStatus,
        hasChildProfile, markHasChildProfile, updateProfilePhoto, signUp, logIn, logOut,
        signInWithGoogleIdToken, finishProfileSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
