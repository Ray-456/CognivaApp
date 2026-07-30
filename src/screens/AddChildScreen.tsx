import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { CONDITIONS } from '../constants/conditions';
import { spacing, radii, useTheme } from '../theme/colors';

export default function AddChildScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const childId: string | undefined = route.params?.childId;
  const isEditing = !!childId;

  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing || !user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'users', user.uid, 'children', childId));
      if (snap.exists()) {
        const data = snap.data() as any;
        setChildName(data.name ?? '');
        setAge(data.age ?? '');
        setSelectedConditions(data.conditions ?? []);
      }
      setLoading(false);
    })();
  }, [isEditing, childId, user]);

  const toggleCondition = (c: string) => {
    setSelectedConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleSave = async () => {
    if (!childName.trim()) {
      Alert.alert('Add a name', "Your child's name is needed to save their profile.");
      return;
    }
    if (selectedConditions.length === 0) {
      Alert.alert('Select at least one', "Choose the condition(s) that best describe your child's needs.");
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'users', user.uid, 'children', childId), {
          name: childName.trim(),
          age: age.trim() || null,
          conditions: selectedConditions,
        });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'children'), {
          name: childName.trim(),
          age: age.trim() || null,
          conditions: selectedConditions,
          createdAt: serverTimestamp(),
        });
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>{isEditing ? 'Edit profile' : 'Add child'}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.ink }]}>Child's name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="e.g. Amara"
          placeholderTextColor={colors.inkFaint}
          value={childName}
          onChangeText={setChildName}
        />

        <Text style={[styles.label, { color: colors.ink }]}>Age (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="e.g. 6"
          placeholderTextColor={colors.inkFaint}
          keyboardType="number-pad"
          value={age}
          onChangeText={setAge}
        />

        <Text style={[styles.label, { color: colors.ink }]}>Condition(s)</Text>
        <Text style={[styles.helperText, { color: colors.inkSoft }]}>Select all that apply.</Text>
        <View style={styles.chipGrid}>
          {CONDITIONS.map((c) => {
            const active = selectedConditions.includes(c);
            return (
              <TouchableOpacity
                key={c}
                onPress={() => toggleCondition(c)}
                style={[
                  styles.conditionChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  active && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.conditionText, { color: colors.inkSoft }, active && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.sm },
  back: { fontWeight: '600', fontSize: 15 },
  headerTitle: { fontWeight: '700', fontSize: 16 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '700', marginBottom: spacing.xs },
  helperText: { fontSize: 12.5, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  conditionChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1 },
  conditionText: { fontSize: 13, fontWeight: '600' },
  primaryButton: { borderRadius: radii.pill, paddingVertical: spacing.md, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
