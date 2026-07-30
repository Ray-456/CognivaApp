import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Icon from '../components/Icon';
import { spacing, radii, useTheme } from '../theme/colors';

type Child = { id: string; name: string; age?: string | null; conditions: string[] };

export default function ManageChildrenScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'children'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setChildren(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return unsubscribe;
  }, [user]);

  const confirmDelete = (child: Child) => {
    Alert.alert(
      `Remove ${child.name}?`,
      "This deletes their profile and can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => user && deleteDoc(doc(db, 'users', user.uid, 'children', child.id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Icon name="back" size={16} color={colors.primary} />
          <Text style={[styles.back, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Child profiles</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddChild')} style={styles.backRow}>
          <Icon name="add" size={16} color={colors.primary} />
          <Text style={[styles.addLink, { color: colors.primary }]}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={children}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <Card>
            <TouchableOpacity onPress={() => navigation.navigate('AddChild', { childId: item.id })}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.childName, { color: colors.ink }]}>{item.name}</Text>
                  {!!item.age && <Text style={[styles.childAge, { color: colors.inkSoft }]}>Age {item.age}</Text>}
                </View>
                <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
                  <Text style={{ color: colors.coral, fontSize: 13, fontWeight: '700' }}>Remove</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipRow}>
                {item.conditions.map((c) => (
                  <Chip key={c} label={c} tone="primary" />
                ))}
              </View>
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.inkFaint }]}>No child profiles yet — tap + Add to create one.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.sm },
  back: { fontWeight: '600', fontSize: 15 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontWeight: '700', fontSize: 16 },
  addLink: { fontWeight: '700', fontSize: 15 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  childName: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  childAge: { fontSize: 13 },
  deleteButton: { paddingVertical: 2, paddingHorizontal: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emptyText: { textAlign: 'center', marginTop: spacing.xl },
});
