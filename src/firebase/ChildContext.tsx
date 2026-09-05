import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { useAuth } from './AuthContext';

export type Child = {
  id: string;
  name: string;
  age?: string | null;
  conditions: string[];
};

type ChildContextValue = {
  children: Child[];
  selectedChild: Child | null;
  selectedChildId: string | null;
  selectChild: (childId: string) => Promise<void>;
  loading: boolean;
};

const SELECTED_CHILD_KEY = 'cogniva.selectedChildId';
const ChildContext = createContext<ChildContextValue | undefined>(undefined);

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [childProfiles, setChildProfiles] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setChildProfiles([]);
      setSelectedChildId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    AsyncStorage.getItem(`${SELECTED_CHILD_KEY}.${user.uid}`).then((savedId) => {
      if (!cancelled && savedId) setSelectedChildId(savedId);
    });

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'children'),
      (snapshot) => {
        const nextChildren = snapshot.docs.map((childDoc) => ({
          id: childDoc.id,
          ...(childDoc.data() as Omit<Child, 'id'>),
        }));
        setChildProfiles(nextChildren);
        setSelectedChildId((currentId) => {
          const savedChildStillExists = currentId && nextChildren.some((child) => child.id === currentId);
          return savedChildStillExists ? currentId : nextChildren[0]?.id ?? null;
        });
        setLoading(false);
      },
      () => {
        setChildProfiles([]);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  const selectChild = async (childId: string) => {
    if (!childProfiles.some((child) => child.id === childId)) return;
    setSelectedChildId(childId);
    if (user) await AsyncStorage.setItem(`${SELECTED_CHILD_KEY}.${user.uid}`, childId);
  };

  const selectedChild = childProfiles.find((child) => child.id === selectedChildId) ?? null;
  const value = useMemo(
    () => ({ children: childProfiles, selectedChild, selectedChildId, selectChild, loading }),
    [childProfiles, selectedChild, selectedChildId, loading],
  );

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChild() {
  const context = useContext(ChildContext);
  if (!context) throw new Error('useChild must be used within ChildProvider');
  return context;
}