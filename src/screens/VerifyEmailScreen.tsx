import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { spacing, radii, useTheme } from '../theme/colors';
import { useAuth } from '../firebase/AuthContext';
import { normalizeAppError, useAppError } from '../components/AppErrorBanner';

export default function VerifyEmailScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, logOut, resendVerificationEmail, refreshVerificationStatus } = useAuth();
  const { showError } = useAppError();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    try {
      await refreshVerificationStatus();
      // If still not verified, refreshVerificationStatus won't throw — the
      // screen simply stays visible since emailVerified is still false.
    } catch (err: any) {
      const normalized = normalizeAppError(err, 'Verification check failed');
      showError(normalized);
      Alert.alert(normalized.title, normalized.message);
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      setJustSent(true);
    } catch (err: any) {
      const normalized = normalizeAppError(err, 'Could not resend verification email');
      showError(normalized);
      Alert.alert(normalized.title, normalized.message);
    } finally {
      setResending(false);
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
        <Text style={styles.emoji}>📩</Text>
        <Text style={[styles.title, { color: colors.ink }]}>Verify your email</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          We sent a verification link to{'\n'}
          <Text style={{ fontWeight: '700', color: colors.ink }}>{user?.email}</Text>.{'\n\n'}
          Tap the link in that email, then come back here.
        </Text>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleCheck} disabled={checking}>
          {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>I've verified — Continue</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={resending} style={{ marginTop: spacing.md }}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            {resending ? 'Sending…' : justSent ? 'Email resent ✓' : 'Resend verification email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logOut} style={{ marginTop: spacing.lg }}>
          <Text style={[styles.linkText, { color: colors.inkSoft }]}>Wrong email? Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: spacing.md },
  backButton: { fontSize: 15, fontWeight: '600' },
  spacer: { width: 56 },
  logo: { width: 56, height: 56 },
  emoji: { fontSize: 40, marginBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 21, marginBottom: spacing.lg },
  primaryButton: { borderRadius: radii.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center', alignSelf: 'stretch' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkText: { fontSize: 14, fontWeight: '600' },
});
