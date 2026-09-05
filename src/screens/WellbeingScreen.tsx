import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Running on empty' },
  { value: 2, emoji: '😕', label: 'Struggling' },
  { value: 3, emoji: '😐', label: 'Getting by' },
  { value: 4, emoji: '🙂', label: 'Doing okay' },
  { value: 5, emoji: '😄', label: 'Feeling good' },
];

const TIPS = [
  {
    id: 'ask-for-help',
    title: "Asking for Help Isn't Failing",
    category: 'Self-Compassion',
    minutes: 4,
    tone: 'primary' as const,
    body: "Many parents feel like needing help means they're not coping well enough. The opposite is true — recognizing when you need support and reaching out for it is one of the most protective things you can do, both for yourself and for your child. Consider: a trusted friend or family member for a few hours of respite, a parent support group (in person or through Cogniva's Community), or a therapist who specializes in caregiver stress. You don't have to wait until you're overwhelmed to ask — building support into your routine before you need it makes a real difference.",
    footerNote: "If you're finding it hard to cope, reaching out to a therapist or counselor for yourself is a sign of strength, not failure.",
  },
  {
    id: 'caregiver-burnout',
    title: 'Recognizing Caregiver Burnout',
    category: 'Burnout',
    minutes: 5,
    tone: 'coral' as const,
    body: "Caregiver burnout doesn't always look like exhaustion — it can show up as irritability, feeling numb, losing interest in things you used to enjoy, or dreading routine caregiving tasks. It's common among parents of children with additional needs, and it isn't a personal failing. Left unaddressed, it affects both your wellbeing and your capacity to show up for your child. Small, consistent steps help more than occasional big gestures: five minutes of quiet before the day starts, a short walk, or simply naming how you feel out loud to someone who'll listen without trying to fix it.",
    footerNote: 'If burnout is affecting your daily life, a conversation with a doctor or therapist can help — this is common and treatable.',
  },
  {
    id: 'permission-to-rest',
    title: 'Giving Yourself Permission to Rest',
    category: 'Rest',
    minutes: 3,
    tone: 'teal' as const,
    body: "Rest often feels like the first thing to cut when time is short, especially when there's always one more thing your child needs. But rest isn't a reward you earn after everything else is done — it's part of what makes it possible to keep going well. This doesn't have to mean big blocks of free time. Even short, protected moments — sitting with a coffee in silence, stepping outside for fresh air, or ten minutes with a book — add up. Try picking one small moment today and protecting it, even if it feels indulgent at first.",
    footerNote: 'Chronic exhaustion that rest alone does not relieve is worth mentioning to a doctor.',
  },
  {
    id: 'connecting-with-other-parents',
    title: 'Why Other Parents Understand Differently',
    category: 'Community',
    minutes: 4,
    tone: 'primary' as const,
    body: "Friends and family often care deeply but may not fully grasp the day-to-day reality of raising a child with additional needs. Connecting with other parents who share similar experiences can ease a specific kind of loneliness — the sense of having to explain or justify things that other parents just understand. Cogniva's Community is built for exactly this. You don't have to share everything; even reading how others navigate similar days can help you feel less alone.",
    footerNote: 'Peer support is a helpful complement to professional support, not a replacement for it when you need one.',
  },
];

function todayKeyLocal() {
  return new Date().toISOString().slice(0, 10);
}

export default function WellbeingScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastCheckin, setLastCheckin] = useState<{ mood: number; day: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'wellbeingCheckins'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setLastCheckin(null);
        return;
      }
      const data = snap.docs[0].data() as any;
      const day = data.createdAt?.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : null;
      setLastCheckin(day ? { mood: data.mood, day } : null);
    });
    return unsubscribe;
  }, [user]);

  const checkedInToday = lastCheckin?.day === todayKeyLocal();

  const submitCheckin = async () => {
    if (!selectedMood || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'wellbeingCheckins'), {
        mood: selectedMood,
        createdAt: serverTimestamp(),
      });
      setSelectedMood(null);
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={typography.display}>Parent Wellbeing</Text>
        <Text style={[typography.body, { marginBottom: spacing.md }]}>
          Supporting your child starts with supporting yourself, too.
        </Text>

        <Card>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>
            {checkedInToday ? "You've checked in today" : 'How are you doing today?'}
          </Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => setSelectedMood(m.value)}
                style={[
                  styles.moodButton,
                  { borderColor: colors.border },
                  selectedMood === m.value && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedMood && (
            <Text style={[typography.body, { color: colors.inkSoft, marginBottom: spacing.sm }]}>
              {MOODS.find((m) => m.value === selectedMood)?.label}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.checkinButton, { backgroundColor: colors.primary, opacity: selectedMood ? 1 : 0.5 }]}
            onPress={submitCheckin}
            disabled={!selectedMood || saving}
          >
            <Text style={styles.checkinButtonText}>{saving ? 'Saving…' : 'Check in'}</Text>
          </TouchableOpacity>
        </Card>

        <TouchableOpacity onPress={() => navigation.navigate('BreathingExercise')}>
          <View style={[styles.breathingCard, { backgroundColor: colors.teal }]}>
            <View>
              <Text style={styles.breathingTitle}>Take a breathing break</Text>
              <Text style={styles.breathingBody}>A 60-second guided breathing exercise, any time you need it.</Text>
            </View>
            <Text style={styles.breathingArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <Text style={[typography.h2, { marginTop: spacing.sm, marginBottom: spacing.sm }]}>For you, not just your child</Text>
        {TIPS.map((tip) => (
          <TouchableOpacity key={tip.id} onPress={() => navigation.navigate('ArticleDetail', { article: tip })}>
            <Card style={styles.tipCard}>
              <View style={{ flex: 1 }}>
                <Chip label={tip.category} tone={tip.tone} />
                <Text style={[styles.tipTitle, { color: colors.ink }]}>{tip.title}</Text>
                <Text style={[typography.caption, { color: colors.inkFaint }]}>{tip.minutes} min read</Text>
              </View>
              <Text style={{ fontSize: 16, color: colors.inkSoft, marginLeft: 8 }}>→</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  header: { marginBottom: spacing.sm },
  back: { fontWeight: '600', fontSize: 15 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  moodButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkinButton: { borderRadius: radii.pill, paddingVertical: 10, alignItems: 'center', marginTop: spacing.xs },
  checkinButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  breathingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md,
  },
  breathingTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 2 },
  breathingBody: { color: 'rgba(255,255,255,0.85)', fontSize: 13, maxWidth: 240 },
  breathingArrow: { color: '#fff', fontSize: 20, fontWeight: '700' },
  tipCard: { flexDirection: 'row', alignItems: 'center' },
  tipTitle: { fontSize: 15, fontWeight: '700', marginTop: 6, marginBottom: 2 },
});
