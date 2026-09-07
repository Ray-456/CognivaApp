import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { collectionGroup, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';

type Invite = {
  id: string; // this is the professional's own uid — same for every doc since it's their doc id in each parent's careTeam
  parentUid: string;
  status: 'pending' | 'approved' | 'declined';
  childIds: string[];
};

export default function MyClientsScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [childNames, setChildNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    // careTeam lives at users/{parentUid}/careTeam/{professionalUid} — a
    // collectionGroup query finds every one of these across all parents
    // where this professional is named.
    const q = query(collectionGroup(db, 'careTeam'), where('professionalId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setInvites(
        snap.docs.map((d) => ({
          id: d.id,
          parentUid: d.ref.parent.parent!.id,
          ...(d.data() as any),
        }))
      );
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    // Look up display names for every child referenced across all approved
    // invites, so the list can show "Amara" instead of a raw child ID.
    const approved = invites.filter((i) => i.status === 'approved');
    approved.forEach((invite) => {
      invite.childIds.forEach(async (childId) => {
        const key = `${invite.parentUid}:${childId}`;
        if (childNames[key]) return;
        try {
          const snap = await getDoc(doc(db, 'users', invite.parentUid, 'children', childId));
          if (snap.exists()) {
            setChildNames((prev) => ({ ...prev, [key]: snap.data().name ?? 'Unnamed' }));
          }
        } catch {
          // Access may not have propagated yet — safe to ignore, list re-renders on next snapshot.
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invites]);

  const respond = async (invite: Invite, status: 'approved' | 'declined') => {
    try {
      await updateDoc(doc(db, 'users', invite.parentUid, 'careTeam', user!.uid), { status });
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message ?? 'Please try again.');
    }
  };

  const pending = invites.filter((i) => i.status === 'pending');
  const approved = invites.filter((i) => i.status === 'approved');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>My Clients</Text>
        <Text style={[typography.body, { marginBottom: spacing.md }]}>
          Families who've added you to their care team.
        </Text>

        {pending.length > 0 && (
          <>
            <Text style={[typography.h2, { marginBottom: spacing.sm }]}>Pending requests</Text>
            {pending.map((invite) => (
              <Card key={invite.parentUid}>
                <Text style={[styles.cardTitle, { color: colors.ink }]}>New care team invite</Text>
                <Text style={[typography.body, { color: colors.inkSoft, marginBottom: spacing.sm }]}>
                  A parent has invited you to access {invite.childIds.length} child profile{invite.childIds.length === 1 ? '' : 's'}.
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => respond(invite, 'approved')}>
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={() => respond(invite, 'declined')}>
                    <Text style={[styles.actionButtonText, { color: colors.inkSoft }]}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}

        <Text style={[typography.h2, { marginTop: spacing.md, marginBottom: spacing.sm }]}>Your clients</Text>
        {approved.length === 0 && (
          <Text style={[typography.body, { color: colors.inkFaint }]}>No connected families yet.</Text>
        )}
        {approved.flatMap((invite) =>
          invite.childIds.map((childId) => (
            <TouchableOpacity
              key={`${invite.parentUid}-${childId}`}
              onPress={() => navigation.navigate('ClientChild', { parentUid: invite.parentUid, childId, childName: childNames[`${invite.parentUid}:${childId}`] ?? 'Client' })}
            >
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Chip label="Approved" tone="teal" />
                    <Text style={[styles.cardTitle, { color: colors.ink, marginTop: 6 }]}>
                      {childNames[`${invite.parentUid}:${childId}`] ?? 'Loading…'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, color: colors.inkSoft }}>→</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  actionButton: { flex: 1, borderRadius: radii.pill, paddingVertical: 10, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
