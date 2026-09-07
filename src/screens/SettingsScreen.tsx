import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../media/cloudinary';
import Card from '../components/Card';
import { Avatar } from '../components/Chip';
import Icon from '../components/Icon';
import { spacing, radii, useTheme } from '../theme/colors';
import { useAuth } from '../firebase/AuthContext';

const parentRows = ['Child profiles', 'Care Team', 'Parent wellbeing', 'Notifications', 'Privacy & data'];
const professionalRows = ['Notifications', 'Privacy & data'];

export default function SettingsScreen({ navigation }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, profile, logOut, updateProfilePhoto } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleChangePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !user) return;

    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(result.assets[0].uri);
      await updateProfilePhoto(url);
    } catch (err: any) {
      Alert.alert('Upload failed', err.message ?? 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
            <Icon name="back" size={16} color={colors.primary} />
            <Text style={[styles.back, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileRow}>
          <TouchableOpacity onPress={handleChangePhoto} disabled={uploading} style={styles.avatarWrap}>
            <Avatar initials={(profile?.name ?? '?').slice(0, 2).toUpperCase()} photoURL={profile?.photoURL} size={64} />
            <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.bg }]}>
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="pencil" size={11} color="#fff" />}
            </View>
          </TouchableOpacity>
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={[styles.profileName, { color: colors.ink }]}>{profile?.name ?? 'Your account'}</Text>
            <Text style={[styles.profileSubtitle, { color: colors.inkSoft }]}>{profile?.role ?? ''} account</Text>
          </View>
        </View>

        <Card>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.ink }]}>Dark mode</Text>
              <Text style={[styles.rowSubtitle, { color: colors.inkSoft }]}>Use a darker palette throughout the app.</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} thumbColor={isDark ? colors.primary : '#f4f3f4'} trackColor={{ false: '#767577', true: colors.primary }} />
          </View>
        </Card>

        <View style={[styles.premiumCard, { backgroundColor: colors.ink }]}> 
          <Text style={[styles.premiumTitle, { color: colors.bg }]}>Cogniva Premium</Text>
          <Text style={[styles.premiumBody, { color: colors.surface }]}>
            Unlock full AI guidance, advanced analytics, and unlimited reports.
          </Text>
          <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.primary }]}> 
            <Text style={[styles.upgradeButtonText, { color: colors.surface }]}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {(profile?.role === 'Parent' ? parentRows : professionalRows).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => {
              if (r === 'Child profiles') navigation.navigate('ManageChildren');
              if (r === 'Parent wellbeing') navigation.navigate('Wellbeing');
              if (r === 'Care Team') navigation.navigate('CareTeam');
            }}
          >
            <Card>
              <Text style={[styles.rowTitle, { color: colors.ink }]}>{r}</Text>
            </Card>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
          <Text style={[styles.logoutText, { color: colors.coral }]}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  header: { marginBottom: spacing.sm },
  back: { fontWeight: '600', fontSize: 15 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatarWrap: { position: 'relative' },
  editBadge: {
    position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  editBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileSubtitle: { fontSize: 14, marginTop: 2 },
  premiumCard: { borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md },
  premiumTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  premiumBody: { fontSize: 13.5, lineHeight: 19, marginBottom: spacing.sm, opacity: 0.82 },
  upgradeButton: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 18 },
  upgradeButtonText: { fontWeight: '700', fontSize: 13 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSubtitle: { fontSize: 13.5, marginTop: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoutButton: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  logoutText: { fontWeight: '700', fontSize: 15 },
});
