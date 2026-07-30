import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { spacing, radii, useTheme } from '../theme/colors';
import { useAuth, Role } from '../firebase/AuthContext';

const roles: Role[] = ['Parent', 'Therapist', 'Psychologist'];

export default function CompleteProfileScreen() {
  const { colors } = useTheme();
  const { user, finishProfileSetup, logOut } = useAuth();
  const [name, setName] = useState(user?.displayName ?? '');
  const [role, setRole] = useState<Role>('Parent');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Add your name', 'Let us know what to call you.');
      return;
    }
    setSubmitting(true);
    try {
      await finishProfileSetup(name.trim(), role);
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message ?? 'Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.ink }]}>Almost there</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          Signed in as {user?.email}. Just need a couple more details.
        </Text>

        <Text style={[styles.label, { color: colors.ink }]}>Your name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="Your name"
          placeholderTextColor={colors.inkFaint}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.ink }]}>I am a...</Text>
        <View style={styles.roleRow}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, { backgroundColor: colors.surface, borderColor: colors.border }, role === r && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleText, { color: colors.inkSoft }, role === r && { color: '#fff' }]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Saving…' : 'Continue'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logOut} style={{ marginTop: spacing.md }}>
          <Text style={[styles.linkText, { color: colors.inkSoft }]}>Not you? Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  logo: { width: 64, height: 64, alignSelf: 'center', marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '700', marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.md },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  roleChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radii.pill, borderWidth: 1 },
  roleText: { fontSize: 12.5, fontWeight: '600' },
  primaryButton: { borderRadius: radii.pill, paddingVertical: spacing.md, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkText: { textAlign: 'center', fontSize: 14, fontWeight: '600' },
});
