import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { radii, useTheme } from '../theme/colors';

type ChipTone = 'primary' | 'teal' | 'coral' | 'neutral';

export default function Chip({ label, tone = 'neutral' }: { label: string; tone?: ChipTone }) {
  const { colors } = useTheme();
  const tones = {
    primary: { bg: colors.primarySoft, fg: colors.primary },
    teal: { bg: colors.tealSoft, fg: colors.teal },
    coral: { bg: colors.coralSoft, fg: colors.coral },
    neutral: { bg: colors.divider, fg: colors.inkSoft },
  } as const;
  const t = tones[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}> 
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function Avatar({
  initials,
  tone = 'primary',
  photoURL,
  size = 40,
}: {
  initials: string;
  tone?: ChipTone;
  photoURL?: string | null;
  size?: number;
}) {
  const { colors } = useTheme();
  const tones = {
    primary: { bg: colors.primarySoft, fg: colors.primary },
    teal: { bg: colors.tealSoft, fg: colors.teal },
    coral: { bg: colors.coralSoft, fg: colors.coral },
    neutral: { bg: colors.divider, fg: colors.inkSoft },
  } as const;
  const t = tones[tone];

  if (photoURL) {
    return <Image source={{ uri: photoURL }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg }]}>
      <Text style={[styles.avatarText, { color: t.fg, fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: radii.pill, alignSelf: 'flex-start' },
  label: { fontSize: 12, fontWeight: '700' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', fontSize: 15 },
});
