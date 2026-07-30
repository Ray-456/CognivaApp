import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp,
  doc, setDoc, deleteDoc, getDoc, increment, updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth, Role } from '../firebase/AuthContext';
import PostCard, { Post } from '../components/PostCard';
import { Avatar } from '../components/Chip';
import Icon from '../components/Icon';
import { spacing, radii, useTheme } from '../theme/colors';

const filters: ('All' | Role)[] = ['All', 'Parent', 'Therapist', 'Psychologist'];

export default function CommunityScreen({ navigation }: any) {
  const { user, profile } = useAuth();
  const { colors, typography } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'All' | Role>('All');
  const [draft, setDraft] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [posting, setPosting] = useState(false);

  // Live-subscribe to the global posts feed, newest first.
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return unsubscribe;
  }, []);

  // Track which of the currently loaded posts the signed-in user has liked.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const liked = new Set<string>();
      await Promise.all(
        posts.map(async (p) => {
          const likeDoc = await getDoc(doc(db, 'posts', p.id, 'likes', user.uid));
          if (likeDoc.exists()) liked.add(p.id);
        })
      );
      setLikedIds(liked);
    })();
  }, [posts.length, user]);

  const visible = filter === 'All' ? posts : posts.filter((p) => p.authorRole === filter);

  const submitPost = async () => {
    if (!draft.trim() || !user || !profile) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile.name,
        authorRole: profile.role,
        authorPhotoURL: profile.photoURL ?? null,
        text: draft.trim(),
        likeCount: 0,
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
      setDraft('');
    } catch (err: any) {
      Alert.alert("Couldn't post", err.message ?? 'Something went wrong.');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
    const postRef = doc(db, 'posts', post.id);
    const alreadyLiked = likedIds.has(post.id);
    try {
      if (alreadyLiked) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likeCount: increment(-1) });
        setLikedIds((prev) => { const next = new Set(prev); next.delete(post.id); return next; });
      } else {
        await setDoc(likeRef, { createdAt: serverTimestamp() });
        await updateDoc(postRef, { likeCount: increment(1) });
        setLikedIds((prev) => new Set(prev).add(post.id));
      }
    } catch (err: any) {
      Alert.alert('Action failed', err.message ?? 'Try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={typography.display}>Community</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Avatar initials={(profile?.name ?? '?').slice(0, 2).toUpperCase()} photoURL={profile?.photoURL} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(f) => f}
        style={styles.filterRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.lg }}
        renderItem={({ item: f }) => (
          <TouchableOpacity onPress={() => setFilter(f)}>
            <View style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }, filter === f && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              <Text style={[styles.filterText, { color: colors.inkSoft }, filter === f && { color: '#fff' }]}>{f}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={[styles.composer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.composerInput, { color: colors.ink }]}
              placeholder="Share something with the community…"
              placeholderTextColor={colors.inkFaint}
              value={draft}
              onChangeText={setDraft}
              multiline
            />
            <View style={styles.composerRow}>
              <View style={styles.mediaRow}>
                <TouchableOpacity style={styles.mediaButton} onPress={() => Alert.alert('Coming soon', 'Photo attachments are on the way.')}>
                  <Icon name="camera" size={18} color={colors.inkSoft} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={() => Alert.alert('Coming soon', 'Video attachments are on the way.')}>
                  <Icon name="video" size={18} color={colors.inkSoft} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.postButton, { backgroundColor: colors.primary }]} onPress={submitPost} disabled={posting || !draft.trim()}>
                <Text style={styles.postButtonText}>{posting ? 'Posting…' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item: post }) => (
          <PostCard
            post={post}
            liked={likedIds.has(post.id)}
            onToggleLike={toggleLike}
            onOpenComments={(postId) => navigation.navigate('PostComments', { postId })}
          />
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.inkFaint }]}>No posts yet — be the first to share something.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  filterRow: { marginVertical: spacing.sm, flexGrow: 0 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radii.pill, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  content: { padding: spacing.lg, paddingTop: spacing.sm },
  composer: { borderRadius: radii.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  composerInput: { fontSize: 15, minHeight: 44, marginBottom: spacing.sm },
  composerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mediaRow: { flexDirection: 'row', gap: 4 },
  mediaButton: { padding: 8 },
  mediaIcon: { fontSize: 18 },
  postButton: { borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 18 },
  postButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: spacing.xl },
});
