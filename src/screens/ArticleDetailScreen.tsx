import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Chip from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';

interface ArticleDetailProps {
  route: any;
  navigation: any;
}

export default function ArticleDetailScreen({ route, navigation }: ArticleDetailProps) {
  const { article } = route.params;
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={[typography.caption, { textAlign: 'center', flex: 1 }]}>{article.minutes} min read</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Article thumb */}
        <View style={[styles.thumb, { backgroundColor: article.tone === 'primary' ? colors.primarySoft : article.tone === 'coral' ? colors.coralSoft : colors.tealSoft }]}>
          <Text style={{ fontSize: 48 }}>📖</Text>
        </View>

        {/* Category chip */}
        <View style={{ marginBottom: spacing.md }}>
          <Chip label={article.category} tone={article.tone} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.ink }]}>{article.title}</Text>

        {/* Body */}
        <Text style={[typography.body, styles.body, { color: colors.inkSoft }]}>{article.body}</Text>

        {/* Footer note */}
        <View style={[styles.footer, { backgroundColor: colors.primarySoft, borderLeftColor: colors.primary }]}> 
          <Text style={[typography.caption, { color: colors.inkSoft }]}>💡 If you have concerns, speak with your child's pediatrician or a specialist.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: spacing.lg,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  footer: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderLeftWidth: 3,
  },
});
