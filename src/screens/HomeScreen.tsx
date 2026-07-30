import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import { Avatar } from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';
import { useAuth } from '../firebase/AuthContext';
import Icon from '../components/Icon';

export default function HomeScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { profile } = useAuth();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={typography.caption}>GOOD MORNING</Text>
            <Text style={typography.display}>Here's Amara's day</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Avatar initials={(profile?.name ?? '?').slice(0, 2).toUpperCase()} photoURL={profile?.photoURL} />
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={typography.caption}>UPCOMING APPOINTMENT</Text>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>Occupational therapy — Thu, 3:00 PM</Text>
        </Card>

        <Card>
          <Text style={typography.caption}>TODAY'S ROUTINE</Text>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>Morning transition checklist</Text>
          <Text style={[typography.body, { color: colors.inkSoft }]}>3 of 5 steps completed</Text>
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
