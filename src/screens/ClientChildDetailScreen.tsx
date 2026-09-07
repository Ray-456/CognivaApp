import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';
import { ToolItem } from './DailyToolkitScreen';

const MOOD_EMOJI: Record<number, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

export default function ClientChildDetailScreen({ route, navigation }: any) {
  const { colors, typography } = useTheme();
  const { parentUid, childId, childName } = route.params;
  const [toolkitItems, setToolkitItems] = useState<ToolItem[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [tab, setTab] = useState<'toolkit' | 'journal'>('toolkit');

  useEffect(() => {
    const q = query(collection(db, 'users', parentUid, 'children', childId, 'toolkitItems'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => setToolkitItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return unsubscribe;
  }, [parentUid, childId]);

  useEffect(() => {
    const q = query(collection(db, 'users', parentUid, 'children', childId, 'journalEntries'), orderBy('createdAt', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, (snap) => setJournalEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return unsubscribe;
  }, [parentUid, childId]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleRow}>
        <Text style={typography.display}>{childName}</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setTab('toolkit')} style={[styles.tabButton, tab === 'toolkit' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
          <Text style={[styles.tabText, { color: tab === 'toolkit' ? colors.primary : colors.inkSoft }]}>Toolkit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('journal')} style={[styles.tabButton, tab === 'journal' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
          <Text style={[styles.tabText, { color: tab === 'journal' ? colors.primary : colors.inkSoft }]}>Journal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'toolkit' ? (
          <>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.ink }]}
              onPress={() => navigation.navigate('AddRoutine', { parentUid, childId })}
            >
              <Text style={styles.addButtonText}>+ Add routine</Text>
            </TouchableOpacity>
            {toolkitItems.length === 0 && (
              <Text style={[typography.body, { color: colors.inkFaint, marginTop: spacing.md }]}>No custom routines yet — this child is using the default toolkit.</Text>
            )}
            {toolkitItems.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => navigation.navigate('RoutineDetail', { routine: item, parentUid, childId })}>
                <Card>
                  <Chip label={item.tag} tone={item.tone} />
                  <Text style={[styles.cardTitle, { color: colors.ink }]}>{item.title}</Text>
                  {!!item.description && <Text style={[typography.body, { color: colors.inkSoft }]}>{item.description}</Text>}
                </Card>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            {journalEntries.length === 0 && (
              <Text style={[typography.body, { color: colors.inkFaint, marginTop: spacing.md }]}>No journal entries shared yet.</Text>
            )}
            {journalEntries.map((e) => (
              <Card key={e.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>{MOOD_EMOJI[e.mood] ?? ''}</Text>
                  <Text style={[typography.caption, { color: colors.inkFaint }]}>{e.createdAt?.toDate ? e.createdAt.toDate().toLocaleDateString() : ''}</Text>
                </View>
                {!!e.note && <Text style={[typography.body, { color: colors.ink }]}>{e.note}</Text>}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: 0 },
  back: { fontWeight: '600', fontSize: 15 },
  titleRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.sm, gap: spacing.lg },
  tabButton: { paddingBottom: 8 },
  tabText: { fontWeight: '700', fontSize: 14 },
  content: { padding: spacing.lg },
  addButton: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 16, marginBottom: spacing.md },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 2 },
});
