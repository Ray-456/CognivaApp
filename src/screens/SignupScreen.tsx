import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { spacing, radii, useTheme } from '../theme/colors';
import { useAuth, Role } from '../firebase/AuthContext';
import { normalizeAppError, useAppError } from '../components/AppErrorBanner';

const professionalRoles: Role[] = ['Therapist', 'Psychologist'];

export default function SignupScreen({ navigation, route }: any) {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const { showError } = useAppError();
  const accountType: 'Parent' | 'Professional' = route.params?.accountType ?? 'Parent';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(accountType === 'Parent' ? 'Parent' : 'Therapist');
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Check your details', 'Name, email, and a password of at least 6 characters are required.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password, role);
      // AuthProvider's onAuthStateChanged picks this up and routes to
      // email verification / mandatory child profile / MainTabs as needed.
    } catch (err: any) {
      const normalized = normalizeAppError(err, 'Signup failed');
      showError(normalized);
      Alert.alert(normalized.title, normalized.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.popToTop()}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.spacer} />
        </View>

        <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]} placeholder="Full name" placeholderTextColor={colors.inkFaint} value={name} onChangeText={setName} />
        <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]} placeholder="Email address" placeholderTextColor={colors.inkFaint} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]} placeholder="Password (min 6 characters)" placeholderTextColor={colors.inkFaint} secureTextEntry value={password} onChangeText={setPassword} />

        {accountType === 'Professional' && (
          <>
            <Text style={[styles.label, { color: colors.ink }]}>I am a...</Text>
            <View style={styles.roleRow}>
              {professionalRoles.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, { backgroundColor: colors.surface, borderColor: colors.border }, role === r && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleText, { color: colors.inkSoft }, role === r && { color: '#fff' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleSignup} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Creating account…' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.linkText, { color: colors.inkSoft }]}>
            Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  backButton: { fontSize: 15, fontWeight: '600' },
  spacer: { width: 56 },
  logo: { width: 64, height: 64, alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md },
  input: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.sm },
  label: { fontSize: 13, fontWeight: '700', marginTop: spacing.xs, marginBottom: spacing.xs },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  roleChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radii.pill, borderWidth: 1 },
  roleText: { fontSize: 13, fontWeight: '600' },
  primaryButton: { borderRadius: radii.pill, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs, marginBottom: spacing.md },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkText: { textAlign: 'center', fontSize: 14 },
});
