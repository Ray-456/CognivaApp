import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import Card from './Card';
import Chip, { Avatar } from './Chip';
import Icon from './Icon';
import { spacing, radii, useTheme } from '../theme/colors';
import { Role } from '../firebase/AuthContext';

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorPhotoURL?: string | null;
  text: string;
  likeCount: number;
  commentCount: number;
};

type PreviewComment = { id: string; authorName: string; authorPhotoURL?: string | null; text: string };

const roleTone: Record<Role, 'primary' | 'teal' | 'coral'> = {
  Parent: 'primary',
  Therapist: 'teal',
  Psychologist: 'coral',
};

const PREVIEW_COUNT = 3;

export default function PostCard({
  post,
  liked,
  onToggleLike,
  onOpenComments,
}: {
  post: Post;
  liked: boolean;
  onToggleLike: (post: Post) => void;
  onOpenComments: (postId: string) => void;
}) {
  const { colors } = useTheme();
  const [preview, setPreview] = useState<PreviewComment[]>([]);

  // Live preview of the first few comments, right under the post — no need
  // to open a new screen just to see who said what.
  useEffect(() => {
    const q = query(
      collection(db, 'posts', post.id, 'comments'),
      orderBy('createdAt', 'asc'),
      limit(PREVIEW_COUNT)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setPreview(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    }, (error) => {
      console.error('Unable to load post comments.', error);
      setPreview([]);
    });
    return unsubscribe;
  }, [post.id]);

  const comingSoon = () => Alert.alert('Coming soon', 'Photo and video attachments are on the way.');

  return (
    <Card>
      <View style={styles.postHeader}>
        <Avatar initials={post.authorName.split(' ').map((n) => n[0]).join('')} tone={roleTone[post.authorRole]} photoURL={post.authorPhotoURL} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={[styles.postName, { color: colors.ink }]}>{post.authorName}</Text>
          <Chip label={post.authorRole} tone={roleTone[post.authorRole]} />
        </View>
      </View>

      <Text style={[styles.postText, { color: colors.ink }]}>{post.text}</Text>

      <View style={[styles.postActions, { borderTopColor: colors.divider }]}>
        <TouchableOpacity style={styles.actionRow} onPress={() => onToggleLike(post)}>
          <Icon name={liked ? 'heartFilled' : 'heartOutline'} size={17} color={liked ? colors.coral : colors.inkSoft} />
          <Text style={[styles.actionText, { color: liked ? colors.coral : colors.inkSoft }]}>{post.likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => onOpenComments(post.id)}>
          <Icon name="comment" size={17} color={colors.inkSoft} />
          <Text style={[styles.actionText, { color: colors.inkSoft }]}>{post.commentCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={comingSoon}>
          <Icon name="camera" size={17} color={colors.inkSoft} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={comingSoon}>
          <Icon name="video" size={17} color={colors.inkSoft} />
        </TouchableOpacity>
      </View>

      {preview.length > 0 && (
        <View style={[styles.previewBlock, { borderTopColor: colors.divider }]}>
          {preview.map((c) => (
            <View key={c.id} style={styles.previewRow}>
              <Avatar initials={c.authorName.slice(0, 2).toUpperCase()} tone="neutral" photoURL={c.authorPhotoURL} />
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <Text style={[styles.previewName, { color: colors.ink }]}>{c.authorName}</Text>
                <Text style={[styles.previewText, { color: colors.ink }]}>{c.text}</Text>
              </View>
            </View>
          ))}
          {post.commentCount > PREVIEW_COUNT && (
            <TouchableOpacity onPress={() => onOpenComments(post.id)}>
              <Text style={[styles.readMore, { color: colors.primary }]}>
                View all {post.commentCount} comments
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  postName: { fontWeight: '700', fontSize: 15, marginBottom: 4 },
  postText: { fontSize: 15, lineHeight: 21, marginBottom: spacing.sm },
  postActions: { flexDirection: 'row', gap: spacing.md, borderTopWidth: 1, paddingTop: spacing.sm },
  actionButton: { paddingVertical: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  actionText: { fontSize: 13.5, fontWeight: '600' },
  previewBlock: { borderTopWidth: 1, marginTop: spacing.sm, paddingTop: spacing.sm },
  previewRow: { flexDirection: 'row', marginBottom: spacing.sm },
  previewName: { fontWeight: '700', fontSize: 13, marginBottom: 1 },
  previewText: { fontSize: 13, lineHeight: 18 },
  readMore: { fontSize: 13, fontWeight: '700', marginTop: 2 },
});
