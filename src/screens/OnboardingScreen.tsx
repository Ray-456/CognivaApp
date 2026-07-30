import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { spacing, radii, useTheme } from '../theme/colors';

import { CONDITIONS } from '../constants/conditions';

export default function OnboardingScreen() {
  const { user, markHasChildProfile } = useAuth();
  const { colors } = useTheme();
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleCondition = (c: string) => {
    setSelectedConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleSave = async () => {
    if (!childName.trim()) {
      Alert.alert('Add a name', "Your child's name is needed to set up their profile.");
      return;
    }
    if (selectedConditions.length === 0) {
      Alert.alert('Select at least one', "Choose the condition(s) that best describe your child's needs — this helps Cogniva show relevant guides and, eventually, matching specialists.");
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'children'), {
        name: childName.trim(),
        age: age.trim() || null,
        conditions: selectedConditions,
        createdAt: serverTimestamp(),
      });
      // Flips hasChildProfile in AuthContext — RootNavigator reacts to this
      // and swaps straight into MainTabs, no manual navigation needed here.
      markHasChildProfile();
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message ?? 'Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.ink }]}>Let's set up your child's profile</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          This is required before you continue — it helps Cogniva show you the right guides, tools, and support.
        </Text>

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
          <Text style={styles.primaryButtonText}>{submitting ? 'Saving…' : 'Save and continue'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  logo: { width: 64, height: 64, alignSelf: 'center', marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: spacing.xs },
  helperText: { fontSize: 12.5, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  conditionChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1 },
  conditionText: { fontSize: 13, fontWeight: '600' },
  primaryButton: { borderRadius: radii.pill, paddingVertical: spacing.md, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
