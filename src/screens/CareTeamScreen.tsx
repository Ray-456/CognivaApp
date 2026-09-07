import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { useChild } from '../firebase/ChildContext';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { Avatar } from '../components/Chip';
import { spacing, radii, useTheme } from '../theme/colors';

type TeamMember = {
  id: string; // professional's uid
  professionalName: string;
  professionalRole: string;
  professionalPhotoURL?: string | null;
  status: 'pending' | 'approved' | 'declined';
  childIds: string[];
};

const findUserByEmail = httpsCallable<{ email: string }, { found: boolean; uid?: string; name?: string; role?: string; photoURL?: string | null }>(
  functions,
  'findUserByEmail'
);

export default function CareTeamScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const { children } = useChild();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<{ uid: string; name: string; role: string; photoURL?: string | null } | null>(null);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'careTeam'), (snap) => {
      setTeam(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return unsubscribe;
  }, [user]);

  const search = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setFound(null);
    try {
      const result = await findUserByEmail({ email: email.trim() });
      if (!result.data.found || !result.data.uid) {
        Alert.alert('No account found', "No Cogniva account exists with that email yet.");
        return;
      }
      if (result.data.role !== 'Therapist' && result.data.role !== 'Psychologist') {
        Alert.alert('Not a professional account', "That email belongs to a Parent account, not a Therapist or Psychologist.");
        return;
      }
      setFound({ uid: result.data.uid, name: result.data.name ?? '', role: result.data.role, photoURL: result.data.photoURL });
    } catch (err: any) {
      Alert.alert('Search failed', err.message ?? 'Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const toggleChild = (childId: string) => {
    setSelectedChildIds((prev) => (prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]));
  };

  const sendInvite = async () => {
    if (!found || !user || selectedChildIds.length === 0) {
      Alert.alert('Pick at least one child', 'Choose which child this professional should have access to.');
      return;
    }
    setInviting(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'careTeam', found.uid), {
        professionalId: found.uid, // duplicated as a field so the professional can query for it
        professionalName: found.name,
        professionalRole: found.role,
        professionalPhotoURL: found.photoURL ?? null,
        status: 'pending',
        requestedBy: 'parent',
        childIds: selectedChildIds,
        createdAt: serverTimestamp(),
      });
      setShowInvite(false);
      setEmail('');
      setFound(null);
      setSelectedChildIds([]);
    } catch (err: any) {
      Alert.alert('Invite failed', err.message ?? 'Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const revoke = (member: TeamMember) => {
    Alert.alert(`Remove ${member.professionalName}?`, "They'll lose access to any child data you've shared with them.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => user && deleteDoc(doc(db, 'users', user.uid, 'careTeam', member.id)) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRow}>
          <Text style={typography.display}>Care Team</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.ink }]} onPress={() => setShowInvite((s) => !s)}>
            <Text style={styles.addButtonText}>{showInvite ? 'Cancel' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[typography.body, { marginBottom: spacing.md }]}>
          Give a therapist or psychologist access to your child's toolkit and journal.
        </Text>

        {showInvite && (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>Invite a professional</Text>
            <Text style={[typography.caption, { color: colors.inkFaint, marginBottom: spacing.xs }]}>
              They must already have a Cogniva Professional account.
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.ink }]}
              placeholder="Their email address"
              placeholderTextColor={colors.inkFaint}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]} onPress={search} disabled={searching}>
              {searching ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchButtonText}>Search</Text>}
            </TouchableOpacity>

            {found && (
              <View style={[styles.foundBox, { borderColor: colors.border }]}>
                <View style={styles.foundRow}>
                  <Avatar initials={found.name.slice(0, 2).toUpperCase()} photoURL={found.photoURL} />
                  <View style={{ marginLeft: spacing.sm }}>
                    <Text style={[styles.foundName, { color: colors.ink }]}>{found.name}</Text>
                    <Chip label={found.role} tone="primary" />
                  </View>
                </View>

                <Text style={[styles.cardTitle, { color: colors.ink, marginTop: spacing.md }]}>Share access to</Text>
                {children.map((c) => (
                  <TouchableOpacity key={c.id} onPress={() => toggleChild(c.id)} style={styles.childRow}>
                    <View style={[styles.checkbox, { borderColor: colors.border }, selectedChildIds.includes(c.id) && { backgroundColor: colors.primary, borderColor: colors.primary }]} />
                    <Text style={[typography.body, { color: colors.ink }]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={sendInvite} disabled={inviting}>
                  <Text style={styles.saveButtonText}>{inviting ? 'Sending…' : 'Send invite'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}

        {team.map((member) => (
          <Card key={member.id}>
            <View style={styles.memberRow}>
              <Avatar initials={member.professionalName.slice(0, 2).toUpperCase()} photoURL={member.professionalPhotoURL} />
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <Text style={[styles.foundName, { color: colors.ink }]}>{member.professionalName}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Chip label={member.professionalRole} tone="primary" />
                  <Chip
                    label={member.status === 'approved' ? 'Approved' : member.status === 'pending' ? 'Pending' : 'Declined'}
                    tone={member.status === 'approved' ? 'teal' : member.status === 'pending' ? 'neutral' : 'coral'}
                  />
                </View>
              </View>
              <TouchableOpacity onPress={() => revoke(member)}>
                <Text style={{ color: colors.coral, fontWeight: '700', fontSize: 13 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
        {team.length === 0 && !showInvite && (
          <Text style={[typography.body, { color: colors.inkFaint, textAlign: 'center', marginTop: spacing.xl }]}>
            No one on your care team yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  header: { marginBottom: spacing.sm },
  back: { fontWeight: '600', fontSize: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addButton: { borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 16 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.sm },
  searchButton: { borderRadius: radii.pill, paddingVertical: 10, alignItems: 'center' },
  searchButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  foundBox: { borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.md },
  foundRow: { flexDirection: 'row', alignItems: 'center' },
  foundName: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  childRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2 },
  saveButton: { borderRadius: radii.pill, paddingVertical: 10, alignItems: 'center', marginTop: spacing.md },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
});
