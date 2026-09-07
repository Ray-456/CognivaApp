import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot, doc, orderBy, collectionGroup } from 'firebase/firestore';
import { db } from '../firebase/config';
import Card from '../components/Card';
import { Avatar } from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';
import { useAuth } from '../firebase/AuthContext';
import Icon from '../components/Icon';
import ChildSwitcher from '../components/ChildSwitcher';
import { useChild } from '../firebase/ChildContext';
import { ToolItem } from './DailyToolkitScreen';

const DEFAULT_TOOL_IDS = ['morning-routine', 'calm-down', 'screen-wind-down'];
const DEFAULT_STEP_COUNTS: Record<string, number> = { 'morning-routine': 5, 'calm-down': 3, 'screen-wind-down': 3 };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function ParentHome({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user, profile } = useAuth();
  const { selectedChild } = useChild();
  const [toolkitItems, setToolkitItems] = useState<ToolItem[] | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [entriesThisWeek, setEntriesThisWeek] = useState(0);
  const [avgMood, setAvgMood] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !selectedChild) return;

    const itemsQuery = query(collection(db, 'users', user.uid, 'children', selectedChild.id, 'toolkitItems'), orderBy('createdAt', 'asc'));
    const unsubItems = onSnapshot(itemsQuery, (snap) => setToolkitItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ToolItem[]));

    const toolkitRef = doc(db, 'users', user.uid, 'children', selectedChild.id, 'toolkitProgress', todayKey());
    const unsubToolkit = onSnapshot(toolkitRef, (snap) => setCompletedSteps(snap.exists() ? (snap.data().completedSteps ?? {}) : {}));

    const journalQuery = query(collection(db, 'users', user.uid, 'children', selectedChild.id, 'journalEntries'), where('createdAt', '>=', startOfWeek()));
    const unsubJournal = onSnapshot(journalQuery, (snap) => {
      setEntriesThisWeek(snap.size);
      setAvgMood(snap.size > 0 ? snap.docs.reduce((sum, d) => sum + (d.data().mood ?? 0), 0) / snap.size : null);
    });

    return () => {
      unsubItems();
      unsubToolkit();
      unsubJournal();
    };
  }, [user, selectedChild]);

  const { completedCount, totalCount } = useMemo(() => {
    const items = toolkitItems && toolkitItems.length > 0 ? toolkitItems : null;
    if (items) {
      const done = items.filter((t) => (completedSteps[t.id]?.length ?? 0) >= Math.max(t.steps?.length ?? 0, 1)).length;
      return { completedCount: done, totalCount: items.length };
    }
    // No custom items yet — child is on the 3 defaults.
    const done = DEFAULT_TOOL_IDS.filter((id) => (completedSteps[id]?.length ?? 0) >= DEFAULT_STEP_COUNTS[id]).length;
    return { completedCount: done, totalCount: DEFAULT_TOOL_IDS.length };
  }, [toolkitItems, completedSteps]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTitleBlock}>
          <Text style={typography.caption}>GOOD MORNING</Text>
          <Text numberOfLines={2} style={[typography.display, styles.headerTitle]}>
            {selectedChild ? `Here's ${selectedChild.name}'s day` : 'Your day at a glance'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <ChildSwitcher />
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Avatar initials={(profile?.name ?? '?').slice(0, 2).toUpperCase()} photoURL={profile?.photoURL} />
          </TouchableOpacity>
        </View>
      </View>

      <Card>
        <Text style={typography.caption}>TODAY'S ROUTINE</Text>
        <Text style={[styles.cardTitle, { color: colors.ink }]}>Daily Toolkit progress</Text>
        <Text style={[typography.body, { color: colors.inkSoft }]}>
          {completedCount} of {totalCount} routines completed today
        </Text>
      </Card>

      <Card>
        <Text style={typography.caption}>THIS WEEK</Text>
        <Text style={[styles.cardTitle, { color: colors.ink }]}>
          {entriesThisWeek > 0 ? `${entriesThisWeek} journal ${entriesThisWeek === 1 ? 'entry' : 'entries'} logged` : 'No journal entries yet this week'}
        </Text>
        <Text style={[typography.body, { color: colors.inkSoft }]}>
          {avgMood ? `Average mood: ${avgMood.toFixed(1)}/5` : 'Log a mood in the Journal to see a trend here'}
        </Text>
      </Card>

      <TouchableOpacity onPress={() => navigation.navigate('AIAssistant')}>
        <View style={[styles.assistantCard, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.assistantTitle}>Ask the AI Assistant</Text>
            <Text style={[styles.assistantBody, { color: colors.primarySoft }]}>Get a supportive answer to a question, any time.</Text>
          </View>
          <Text style={[styles.assistantArrow, { color: colors.surface }]}>→</Text>
        </View>
      </TouchableOpacity>

      <Text style={[typography.h2, { marginTop: spacing.sm, marginBottom: spacing.sm }]}>Quick actions</Text>
      <View style={styles.quickRow}>
        <TouchableOpacity style={[styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Toolkit')}>
          <Icon name="lightning" size={22} style={styles.quickEmoji} />
          <Text style={[styles.quickLabel, { color: colors.inkSoft }]}>Toolkit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Journal')}>
          <Icon name="chart" size={22} style={styles.quickEmoji} />
          <Text style={[styles.quickLabel, { color: colors.inkSoft }]}>Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Learn')}>
          <Icon name="book" size={22} style={styles.quickEmoji} />
          <Text style={[styles.quickLabel, { color: colors.inkSoft }]}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Community')}>
          <Icon name="community" size={22} style={styles.quickEmoji} />
          <Text style={[styles.quickLabel, { color: colors.inkSoft }]}>Community</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ProfessionalHome({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user, profile } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(collectionGroup(db, 'careTeam'), where('professionalId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => d.data() as any);
      setPendingCount(docs.filter((d) => d.status === 'pending').length);
      setClientCount(docs.filter((d) => d.status === 'approved').reduce((sum, d) => sum + (d.childIds?.length ?? 0), 0));
    });
    return unsubscribe;
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTitleBlock}>
          <Text style={typography.caption}>WELCOME BACK</Text>
          <Text numberOfLines={2} style={[typography.display, styles.headerTitle]}>{profile?.name ?? 'Your dashboard'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Avatar initials={(profile?.name ?? '?').slice(0, 2).toUpperCase()} photoURL={profile?.photoURL} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('MyClients')}>
        <Card>
          <Text style={typography.caption}>YOUR CARE TEAM WORK</Text>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>
            {pendingCount > 0 ? `${pendingCount} pending request${pendingCount === 1 ? '' : 's'}` : `${clientCount} connected ${clientCount === 1 ? 'client' : 'clients'}`}
          </Text>
          <Text style={[typography.body, { color: colors.inkSoft }]}>Tap to view your clients and any pending invites.</Text>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('AIAssistant')}>
        <View style={[styles.assistantCard, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.assistantTitle}>Ask the AI Assistant</Text>
            <Text style={[styles.assistantBody, { color: colors.primarySoft }]}>Get a supportive answer to a question, any time.</Text>
          </View>
          <Text style={[styles.assistantArrow, { color: colors.surface }]}>→</Text>
        </View>
      </TouchableOpacity>

      <Text style={[typography.h2, { marginTop: spacing.sm, marginBottom: spacing.sm }]}>Quick actions</Text>
      <View style={styles.quickRow}>
        <TouchableOpacity style={[styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Learn')}>
          <Icon name="book" size={22} style={styles.quickEmoji} />
          <Text style={[styles.quickLabel, { color: colors.inkSoft }]}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Community')}>
          <Icon name="community" size={22} style={styles.quickEmoji} />
          <Text style={[styles.quickLabel, { color: colors.inkSoft }]}>Community</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function HomeScreen(props: any) {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const isProfessional = profile?.role === 'Therapist' || profile?.role === 'Psychologist';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      {isProfessional ? <ProfessionalHome {...props} /> : <ParentHome {...props} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  header: { marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitleBlock: { marginBottom: spacing.sm, flex: 1 },
  headerTitle: { flexShrink: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 2 },
  assistantCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md },
  assistantTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 2 },
  assistantBody: { fontSize: 13 },
  assistantArrow: { fontSize: 20, fontWeight: '700' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  quickButton: { flex: 1, alignItems: 'center', borderRadius: radii.md, borderWidth: 1, paddingVertical: spacing.sm },
  quickEmoji: { marginBottom: 4 },
  quickLabel: { fontSize: 11.5, fontWeight: '600' },
});
