import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { spacing, radii, useTheme } from '../theme/colors';
import { useGoogleSignIn } from '../firebase/useGoogleSignIn';

export default function RoleSelectScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { promptGoogleSignIn, requestReady } = useGoogleSignIn();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.spacer} />
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.spacer} />
        </View>
        <Text style={[styles.title, { color: colors.ink }]}>Welcome to Cogniva</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>How will you be using Cogniva?</Text>
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Signup', { accountType: 'Parent' })}
        >
          <Text style={styles.optionEmoji}>👨‍👩‍👧</Text>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={[styles.optionTitle, { color: colors.ink }]}>I'm a Parent or Guardian</Text>
            <Text style={[styles.optionBody, { color: colors.inkSoft }]}>Set up your child's profile and get support from the community.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Signup', { accountType: 'Professional' })}
        >
          <Text style={styles.optionEmoji}>🩺</Text>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={[styles.optionTitle, { color: colors.ink }]}>I'm a Professional</Text>
            <Text style={[styles.optionBody, { color: colors.inkSoft }]}>Therapist or psychologist joining to support families.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.md }}>
          <Text style={[styles.linkText, { color: colors.inkSoft }]}>
            Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Log in</Text>
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
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  spacer: { width: 48 },
  logo: { width: 72, height: 72, alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: spacing.lg },
  optionCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm },
  optionEmoji: { fontSize: 28 },
  optionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  optionBody: { fontSize: 13, lineHeight: 18 },
  linkText: { textAlign: 'center', fontSize: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12.5, fontWeight: '600' },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderRadius: radii.pill, paddingVertical: 13 },
  googleIcon: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600' },
});
