import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Alert } from 'react-native';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { useChild } from '../firebase/ChildContext';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';
import { ToolItem } from './DailyToolkitScreen';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function RoutineDetailScreen({ route, navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const { selectedChild } = useChild();
  const routine: ToolItem = route.params.routine;
  const parentUidOverride: string | undefined = route.params?.parentUid;
  const childIdOverride: string | undefined = route.params?.childId;
  const ownerUid = parentUidOverride ?? user?.uid;
  const childId = childIdOverride ?? selectedChild?.id;
  // A professional viewing a client's routine can see it and delete routines
  // they created, but doesn't check off the family's daily steps themselves.
  const readOnly = !!parentUidOverride && parentUidOverride !== user?.uid;
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);

  const steps = routine.steps?.length ? routine.steps : ['Mark as done']; // routines with no steps get one implicit step

  useEffect(() => {
    if (!ownerUid || !childId) return;
    const ref = doc(db, 'users', ownerUid, 'children', childId, 'toolkitProgress', todayKey());
    const unsubscribe = onSnapshot(ref, (snap) => {
      const all = snap.exists() ? (snap.data().completedSteps ?? {}) : {};
      setCompletedIndices(all[routine.id] ?? []);
    });
    return unsubscribe;
  }, [ownerUid, childId, routine.id]);

  const toggleStep = async (index: number) => {
    if (readOnly || !ownerUid || !childId) return;
    const next = completedIndices.includes(index) ? completedIndices.filter((i) => i !== index) : [...completedIndices, index];
    setCompletedIndices(next);
    await setDoc(
      doc(db, 'users', ownerUid, 'children', childId, 'toolkitProgress', todayKey()),
      { completedSteps: { [routine.id]: next } },
      { merge: true }
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert("Couldn't open link", url));
  };

  const deleteRoutine = () => {
    Alert.alert('Delete this routine?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!ownerUid || !childId) return;
          await deleteDoc(doc(db, 'users', ownerUid, 'children', childId, 'toolkitItems', routine.id));
          navigation.goBack();
        },
      },
    ]);
  };

  const isCustom = !['morning-routine', 'calm-down', 'screen-wind-down'].includes(routine.id);
  const canDelete = isCustom && (!readOnly || routine.createdBy === user?.uid);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        {canDelete && (
          <TouchableOpacity onPress={deleteRoutine}>
            <Text style={{ color: colors.coral, fontWeight: '700', fontSize: 13 }}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Chip label={routine.tag} tone={routine.tone} />
        <Text style={[typography.display, { marginTop: spacing.sm, marginBottom: 4 }]}>{routine.title}</Text>
        {!!routine.description && <Text style={[typography.body, { color: colors.inkSoft, marginBottom: spacing.md }]}>{routine.description}</Text>}

        {routine.imageUrls?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            {routine.imageUrls.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.image} />
            ))}
          </ScrollView>
        )}

        {(routine.referenceLink || routine.videoUrl) && (
          <View style={styles.linkRow}>
            {routine.referenceLink && (
              <TouchableOpacity style={[styles.linkButton, { backgroundColor: colors.primarySoft }]} onPress={() => openLink(routine.referenceLink!.url)}>
                <Text style={[styles.linkButtonText, { color: colors.primary }]}>📄 {routine.referenceLink.label || 'Read more'}</Text>
              </TouchableOpacity>
            )}
            {routine.videoUrl && (
              <TouchableOpacity style={[styles.linkButton, { backgroundColor: colors.coralSoft }]} onPress={() => openLink(routine.videoUrl!)}>
                <Text style={[styles.linkButtonText, { color: colors.coral }]}>▶ Watch video</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={[typography.h2, { marginTop: spacing.md, marginBottom: spacing.sm }]}>Steps</Text>
        <Card>
          {steps.map((step, index) => {
            const done = completedIndices.includes(index);
            return (
              <TouchableOpacity key={index} onPress={() => toggleStep(index)} style={styles.stepRow} disabled={readOnly}>
                <View style={[styles.checkbox, { borderColor: colors.border }, done && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  {done && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[typography.body, { color: colors.ink, textDecorationLine: done ? 'line-through' : 'none' }]}>{step}</Text>
              </TouchableOpacity>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: 0 },
  back: { fontWeight: '600', fontSize: 15 },
  content: { padding: spacing.lg },
  image: { width: 220, height: 160, borderRadius: 12, marginRight: spacing.sm },
  linkRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' },
  linkButton: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  linkButtonText: { fontWeight: '700', fontSize: 13 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
