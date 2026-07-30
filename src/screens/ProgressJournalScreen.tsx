import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import { spacing, radii, useTheme } from '../theme/colors';

export default function ProgressJournalScreen() {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={typography.display}>Journal</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.ink }]}> 
            <Text style={styles.addButtonText}>+ Log entry</Text>
          </TouchableOpacity>
        </View>
        <Text style={[typography.body, { marginBottom: spacing.md }]}>
          Track wins and challenges over time.
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.ink }]}>4</Text>
            <Text style={[typography.caption, { color: colors.inkFaint }]}>ENTRIES THIS WEEK</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statNumber, { color: colors.ink }]}>↑ 20%</Text>
            <Text style={[typography.caption, { color: colors.inkFaint }]}>MOOD TREND</Text>
          </View>
        </View>

        <Card>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>Generate a report</Text>
          <Text style={[typography.body, { color: colors.inkSoft }]}>Export a PDF summary to share with your child's therapist or teacher.</Text>
          <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.primary }]}> 
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  addButton: { borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 16 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statBox: { flex: 1, borderRadius: radii.lg, borderWidth: 1, padding: spacing.md },
  statNumber: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  exportButton: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 18, marginTop: spacing.sm },
  exportButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
