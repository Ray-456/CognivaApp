import React from 'react';
import { Platform, View, StyleSheet, ViewStyle } from 'react-native';
import { radii, spacing, useTheme } from '../theme/colors';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
};

// Modern card: white surface, hairline border, soft shadow. No thick
// colored borders — accent color, if any, lives inside the content
// (an icon chip, a small badge) rather than around the whole card.
export default function Card({ children, style, noPadding }: CardProps) {
  const { colors } = useTheme();

  const shadowStyle = Platform.OS === 'web'
    ? { boxShadow: `0 4px 12px ${colors.shadow}` }
    : { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 1 };

  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadowStyle, noPadding && { padding: 0 }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
