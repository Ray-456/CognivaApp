import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
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

  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }, noPadding && { padding: 0 }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 1,
  },
});
