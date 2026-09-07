import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { useChild } from '../firebase/ChildContext';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';

// Shown until anyone (parent or a connected professional) adds custom
// routines — once toolkitItems exist in Firestore, those replace this.
const DEFAULT_TOOLS = [
  { id: 'morning-routine', title: 'Morning Routine', description: '5-step visual checklist', tag: 'Routine', tone: 'primary' as const, steps: ['Get dressed', 'Brush teeth', 'Eat breakfast', 'Pack bag', 'Put on shoes'], imageUrls: [], referenceLink: null, videoUrl: null },
  { id: 'calm-down', title: 'Calm-Down Strategies', description: 'For sensory overload moments', tag: 'Regulation', tone: 'coral' as const, steps: ['Find a quiet space', 'Take 5 deep breaths', 'Use a fidget or weighted item'], imageUrls: [], referenceLink: null, videoUrl: null },
  { id: 'screen-wind-down', title: 'Screen Time Wind-Down', description: 'Gentle bedtime transition activity', tag: 'Routine', tone: 'teal' as const, steps: ['10-minute warning', 'Turn off screens', 'Quiet activity (book, puzzle)'], imageUrls: [], referenceLink: null, videoUrl: null },
];

export type ToolItem = {
  id: string;
  title: string;
  description: string;
  tag: string;
  tone: 'primary' | 'coral' | 'teal';
  steps: string[];
  imageUrls: string[];
  referenceLink: { label: string; url: string } | null;
  videoUrl: string | null;
  createdBy?: string;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyToolkitScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const { selectedChild } = useChild();
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [customItems, setCustomItems] = useState<ToolItem[] | null>(null);

  useEffect(() => {
    if (!user || !selectedChild) return;
    const ref = doc(db, 'users', user.uid, 'children', selectedChild.id, 'toolkitProgress', todayKey());
    const unsubscribe = onSnapshot(ref, (snap) => {
      setCompletedSteps(snap.exists() ? (snap.data().completedSteps ?? {}) : {});
    });
    return unsubscribe;
  }, [user, selectedChild]);

  useEffect(() => {
    if (!user || !selectedChild) return;
    const q = query(collection(db, 'users', user.uid, 'children', selectedChild.id, 'toolkitItems'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setCustomItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ToolItem[]);
    });
    return unsubscribe;
  }, [user, selectedChild]);

  const tools: ToolItem[] = customItems && customItems.length > 0 ? customItems : (DEFAULT_TOOLS as ToolItem[]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={typography.display}>{selectedChild ? `${selectedChild.name}'s Toolkit` : 'Daily Toolkit'}</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.ink }]} onPress={() => navigation.navigate('AddRoutine')}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={[typography.body, { marginBottom: spacing.md }]}>Routines and strategies you can use today.</Text>

        {tools.map((t) => {
          const stepCount = Math.max(t.steps?.length ?? 0, 1);
          const doneCount = (completedSteps[t.id] ?? []).length;
          const fullyDone = doneCount >= stepCount;
          return (
            <TouchableOpacity key={t.id} onPress={() => navigation.navigate('RoutineDetail', { routine: t })}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={[styles.iconChip, { backgroundColor: t.tone === 'primary' ? colors.primarySoft : t.tone === 'coral' ? colors.coralSoft : colors.tealSoft }]}>
                    <Text style={{ fontSize: 20 }}>{t.tone === 'primary' ? '🌤️' : t.tone === 'coral' ? '🌿' : '🌙'}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Chip label={t.tag} tone={t.tone} />
                    <Text style={[styles.cardTitle, { color: colors.ink }]}>{t.title}</Text>
                    <Text style={[typography.body, { color: colors.inkSoft }]}>{t.description}</Text>
                    <Text style={[typography.caption, { color: fullyDone ? colors.teal : colors.inkFaint, marginTop: 4 }]}>
                      {fullyDone ? '✓ Completed today' : `${doneCount} of ${stepCount} steps done today`}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, color: colors.inkSoft }}>→</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addButton: { borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 16 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  iconChip: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 2 },
});
