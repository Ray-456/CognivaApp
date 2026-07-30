import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';

const tools = [
  { title: 'Morning Routine', desc: '5-step visual checklist', tag: 'Routine', tone: 'primary' as const, emoji: '🌤️' },
  { title: 'Calm-Down Strategies', desc: 'For sensory overload moments', tag: 'Regulation', tone: 'coral' as const, emoji: '🌿' },
  { title: 'Screen Time Wind-Down', desc: 'Gentle bedtime transition activity', tag: 'Routine', tone: 'teal' as const, emoji: '🌙' },
];

export default function DailyToolkitScreen() {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>Daily Toolkit</Text>
        <Text style={[typography.body, { marginBottom: spacing.md }]}>
          Routines and strategies you can use today.
        </Text>
        {tools.map((t) => (
          <Card key={t.title}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={[styles.iconChip, { backgroundColor: t.tone === 'primary' ? colors.primarySoft : t.tone === 'coral' ? colors.coralSoft : colors.tealSoft }]}>
                <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Chip label={t.tag} tone={t.tone} />
                <Text style={[styles.cardTitle, { color: colors.ink }]}>{t.title}</Text>
                <Text style={[typography.body, { color: colors.inkSoft }]}>{t.desc}</Text>
                <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.ink }]}> 
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  iconChip: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 2 },
  startButton: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingVertical: 7, paddingHorizontal: 16, marginTop: spacing.sm },
  startButtonText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
});
