import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Card from '../components/Card';
import { Avatar } from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';
import { useAuth } from '../firebase/AuthContext';
import Icon from '../components/Icon';
import ChildSwitcher from '../components/ChildSwitcher';
import { useChild } from '../firebase/ChildContext';

const TOOLKIT_ITEM_COUNT = 3;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function HomeScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user, profile } = useAuth();
  const { selectedChild } = useChild();
  const [completedToday, setCompletedToday] = useState(0);
  const [entriesThisWeek, setEntriesThisWeek] = useState(0);
  const [avgMood, setAvgMood] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !selectedChild) return;

    const toolkitRef = doc(db, 'users', user.uid, 'children', selectedChild.id, 'toolkitProgress', todayKey());
    const unsubToolkit = onSnapshot(toolkitRef, (snap) => {
      setCompletedToday(snap.exists() ? (snap.data().completedIds?.length ?? 0) : 0);
    });

    const journalQuery = query(collection(db, 'users', user.uid, 'children', selectedChild.id, 'journalEntries'), where('createdAt', '>=', startOfWeek()));
    const unsubJournal = onSnapshot(journalQuery, (snap) => {
      setEntriesThisWeek(snap.size);
      if (snap.size > 0) {
        const total = snap.docs.reduce((sum, d) => sum + (d.data().mood ?? 0), 0);
        setAvgMood(total / snap.size);
      } else {
        setAvgMood(null);
      }
    });

    return () => {
      unsubToolkit();
      unsubJournal();
    };
  }, [user, selectedChild]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={typography.caption}>GOOD MORNING</Text>
            <Text style={typography.display}>{selectedChild ? `Here's ${selectedChild.name}'s day` : 'Your day at a glance'}</Text>
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
            {completedToday} of {TOOLKIT_ITEM_COUNT} routines completed today
          </Text>
        </Card>

        <Card>
          <Text style={typography.caption}>THIS WEEK</Text>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>
            {entriesThisWeek > 0
              ? `${entriesThisWeek} journal ${entriesThisWeek === 1 ? 'entry' : 'entries'} logged`
              : 'No journal entries yet this week'}
          </Text>
          <Text style={[typography.body, { color: colors.inkSoft }]}>
            {avgMood ? `Average mood: ${avgMood.toFixed(1)}/5` : 'Log a mood in the Journal to see a trend here'}
          </Text>
        </Card>

        <TouchableOpacity onPress={() => navigation.navigate('AIAssistant')}>
          <View style={[styles.assistantCard, { backgroundColor: colors.primary }]}> 
            <View>
              <Text style={styles.assistantTitle}>Ask the AI Assistant</Text>
              <Text style={styles.assistantBody}>Get a supportive answer to a question, any time.</Text>
            </View>
            <Text style={styles.assistantArrow}>→</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  headerActions: { alignItems: 'flex-end', gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 2 },
  assistantCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md,
  },
  assistantTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 2 },
  assistantBody: { color: '#D9D5FA', fontSize: 13 },
  assistantArrow: { color: '#fff', fontSize: 20, fontWeight: '700' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  quickButton: {
    flex: 1, alignItems: 'center', borderRadius: radii.md, borderWidth: 1, paddingVertical: spacing.sm,
  },
  quickEmoji: { marginBottom: 4 },
  quickLabel: { fontSize: 11.5, fontWeight: '600' },
});
