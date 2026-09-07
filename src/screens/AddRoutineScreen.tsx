import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { useChild } from '../firebase/ChildContext';
import { uploadImageToCloudinary } from '../media/cloudinary';
import { spacing, radii, useTheme } from '../theme/colors';

export default function AddRoutineScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { selectedChild } = useChild();

  // If a professional opened this from a client's profile, route params
  // override the "own child" context entirely.
  const ownerUid: string | undefined = route?.params?.parentUid ?? user?.uid;
  const childId: string | undefined = route?.params?.childId ?? selectedChild?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  };
  const addStepField = () => setSteps((prev) => [...prev, '']);
  const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (result.canceled) return;
    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(result.assets[0].uri);
      setImageUrls((prev) => [...prev, url]);
    } catch (err: any) {
      Alert.alert('Upload failed', err.message ?? 'Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give this routine a name.');
      return;
    }
    if (!ownerUid || !childId || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'users', ownerUid, 'children', childId, 'toolkitItems'), {
        title: title.trim(),
        description: description.trim(),
        tag: 'Custom',
        tone: 'primary',
        steps: steps.map((s) => s.trim()).filter(Boolean),
        imageUrls,
        referenceLink: linkUrl.trim() ? { label: linkLabel.trim() || 'Read more', url: linkUrl.trim() } : null,
        videoUrl: videoUrl.trim() || null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Something went wrong', err.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>New Routine</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.ink }]}>Title</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="e.g. Bedtime wind-down"
          placeholderTextColor={colors.inkFaint}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: colors.ink }]}>Description (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="A short summary of this routine"
          placeholderTextColor={colors.inkFaint}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={[styles.label, { color: colors.ink }]}>Steps</Text>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepInputRow}>
            <TextInput
              style={[styles.input, styles.stepInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
              placeholder={`Step ${i + 1}`}
              placeholderTextColor={colors.inkFaint}
              value={step}
              onChangeText={(v) => updateStep(i, v)}
            />
            {steps.length > 1 && (
              <TouchableOpacity onPress={() => removeStep(i)} style={styles.removeStepButton}>
                <Text style={{ color: colors.coral, fontSize: 18, fontWeight: '700' }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={addStepField} style={{ marginBottom: spacing.md }}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>+ Add another step</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.ink }]}>Images (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
          {imageUrls.map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.thumbnail} />
          ))}
        </ScrollView>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]} onPress={pickImage} disabled={uploadingImage}>
          {uploadingImage ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={{ color: colors.ink, fontWeight: '600' }}>+ Add image</Text>}
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.ink, marginTop: spacing.md }]}>Reference link (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="Link label (e.g. 'Read the full guide')"
          placeholderTextColor={colors.inkFaint}
          value={linkLabel}
          onChangeText={setLinkLabel}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="https://..."
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="none"
          keyboardType="url"
          value={linkUrl}
          onChangeText={setLinkUrl}
        />

        <Text style={[styles.label, { color: colors.ink }]}>Video link (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.ink }]}
          placeholder="YouTube or Vimeo link"
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="none"
          keyboardType="url"
          value={videoUrl}
          onChangeText={setVideoUrl}
        />

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={save} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save routine'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.sm },
  back: { fontWeight: '600', fontSize: 15 },
  headerTitle: { fontWeight: '700', fontSize: 16 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '700', marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.sm },
  stepInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepInput: { flex: 1 },
  removeStepButton: { paddingHorizontal: 6, paddingBottom: spacing.sm },
  thumbnail: { width: 80, height: 80, borderRadius: 10, marginRight: spacing.sm },
  secondaryButton: { borderWidth: 1, borderRadius: radii.pill, paddingVertical: 10, alignItems: 'center', marginBottom: spacing.sm },
  saveButton: { borderRadius: radii.pill, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
