import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth, Role } from '../firebase/AuthContext';
import Chip, { Avatar } from '../components/Chip';
import Icon from '../components/Icon';
import { spacing, radii, useTheme } from '../theme/colors';

type Comment = { id: string; authorId: string; authorName: string; authorPhotoURL?: string | null; text: string };
type PostData = { authorName: string; authorRole: Role; authorPhotoURL?: string | null; text: string; likeCount: number; commentCount: number };

const roleTone: Record<Role, 'primary' | 'teal' | 'coral'> = {
  Parent: 'primary',
  Therapist: 'teal',
  Psychologist: 'coral',
};

export default function PostCommentsScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState('');
  const [liked, setLiked] = useState(false);

  // Keep the post itself live too, so like/comment counts update in real time
  // while someone's sitting on this screen.
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'posts', postId), (snap) => {
      if (snap.exists()) setPost(snap.data() as PostData);
    }, (error) => console.error('Unable to load the post.', error));
    return unsubscribe;
  }, [postId]);

  useEffect(() => {
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    }, (error) => {
      console.error('Unable to load comments.', error);
      setComments([]);
    });
    return unsubscribe;
  }, [postId]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'posts', postId, 'likes', user.uid))
      .then((snap) => setLiked(snap.exists()))
      .catch((error) => console.error('Unable to load like status.', error));
  }, [postId, user]);

  const toggleLike = async () => {
    if (!user) return;
    const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
    const postRef = doc(db, 'posts', postId);
    if (liked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likeCount: increment(-1) });
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(postRef, { likeCount: increment(1) });
    }
    setLiked(!liked);
  };

  const submitComment = async () => {
    if (!draft.trim() || !user || !profile) return;
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      authorId: user.uid,
      authorName: profile.name,
      authorPhotoURL: profile.photoURL ?? null,
      text: draft.trim(),
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) });
    setDraft('');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Icon name="back" size={16} color={colors.primary} />
          <Text style={[styles.back, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Post</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          post ? (
            <View style={[styles.originalPost, { borderBottomColor: colors.divider }]}>
              <View style={styles.postHeader}>
                <Avatar initials={post.authorName.split(' ').map((n) => n[0]).join('')} tone={roleTone[post.authorRole]} photoURL={post.authorPhotoURL} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={[styles.postName, { color: colors.ink }]}>{post.authorName}</Text>
                  <Chip label={post.authorRole} tone={roleTone[post.authorRole]} />
                </View>
              </View>
              <Text style={[styles.postText, { color: colors.ink }]}>{post.text}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionRow} onPress={toggleLike}>
                  <Icon name={liked ? 'heartFilled' : 'heartOutline'} size={16} color={liked ? colors.coral : colors.inkSoft} />
                  <Text style={[styles.actionText, { color: liked ? colors.coral : colors.inkSoft }]}>{post.likeCount}</Text>
                </TouchableOpacity>
                <View style={styles.actionRow}>
                  <Icon name="comment" size={16} color={colors.inkSoft} />
                  <Text style={[styles.actionText, { color: colors.inkSoft }]}>{post.commentCount}</Text>
                </View>
              </View>
              <Text style={[styles.commentsLabel, { color: colors.inkFaint }]}>
                {comments.length > 0 ? `${comments.length} comment${comments.length === 1 ? '' : 's'}` : 'Comments'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Avatar initials={item.authorName.slice(0, 2).toUpperCase()} tone="neutral" photoURL={item.authorPhotoURL} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={[styles.commentName, { color: colors.ink }]}>{item.authorName}</Text>
              <Text style={[styles.commentText, { color: colors.inkSoft }]}>{item.text}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.inkFaint }]}>No comments yet — be the first to reply.</Text>}
      />

      <View style={[styles.inputRow, { borderTopColor: colors.divider }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="Write a comment..."
          placeholderTextColor={colors.inkFaint}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submitComment}
        />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={submitComment}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.sm },
  back: { fontWeight: '600', fontSize: 15 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 2 },
  headerTitle: { fontWeight: '700', fontSize: 16 },
  originalPost: { borderBottomWidth: 1, paddingBottom: spacing.md, marginBottom: spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  postName: { fontWeight: '700', fontSize: 15, marginBottom: 4 },
  postText: { fontSize: 15, lineHeight: 21, marginBottom: spacing.sm },
  postActions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  actionButton: { paddingVertical: 2 },
  actionText: { fontSize: 13.5, fontWeight: '600' },
  commentsLabel: { fontSize: 12.5, fontWeight: '700', letterSpacing: 0.3 },
  commentRow: { flexDirection: 'row', marginBottom: spacing.md },
  commentName: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  commentText: { fontSize: 14, lineHeight: 19 },
  emptyText: { textAlign: 'center', marginTop: spacing.xl },
  inputRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 10 },
  sendButton: { borderRadius: radii.pill, paddingHorizontal: 20, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: '700' },
});
