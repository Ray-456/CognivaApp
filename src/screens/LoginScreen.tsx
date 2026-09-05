import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { spacing, radii, useTheme } from '../theme/colors';
import { useAuth } from '../firebase/AuthContext';
import { useGoogleSignIn } from '../firebase/useGoogleSignIn';
import { normalizeAppError, useAppError } from '../components/AppErrorBanner';
import { isValidEmail } from '../utils/validation';

export default function LoginScreen({ navigation }: any) {
  const { logIn } = useAuth();
  const { colors } = useTheme();
  const { showError } = useAppError();
  const { promptGoogleSignIn, requestReady } = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Enter your email and password.');
      return;
    }
    if (!isValidEmail(email)) {
      showError({ title: 'Check your email', message: "That doesn't look like a valid email address — check for typos or extra spaces.", severity: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await logIn(email.trim(), password);
      // onAuthStateChanged in AuthProvider handles the redirect automatically.
    } catch (err: any) {
      const normalized = normalizeAppError(err, 'Login failed');
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
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="Email address"
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="Password"
          placeholderTextColor={colors.inkFaint}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleLogin} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Logging in…' : 'Log In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.linkText, { color: colors.inkSoft }]}>
            Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.inkFaint }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={promptGoogleSignIn}
          disabled={!requestReady}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={[styles.googleText, { color: colors.ink }]}>Continue with Google</Text>
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
  logo: { width: 72, height: 72, alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: spacing.lg },
  input: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, fontSize: 16, marginBottom: spacing.sm },
  primaryButton: { borderRadius: radii.pill, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkText: { textAlign: 'center', fontSize: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12.5, fontWeight: '600' },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderRadius: radii.pill, paddingVertical: 13 },
  googleIcon: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600' },
});
