import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../firebase/AuthContext';
import { useTheme } from '../theme/colors';
import MainTabs from './MainTabs';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import ProgressJournalScreen from '../screens/ProgressJournalScreen';
import KnowledgeHubScreen from '../screens/KnowledgeHubScreen';
import DailyToolkitScreen from '../screens/DailyToolkitScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ManageChildrenScreen from '../screens/ManageChildrenScreen';
import AddChildScreen from '../screens/AddChildScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.loading, { backgroundColor: colors.bg }]}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export default function RootNavigator() {
  const { user, profile, loading, emailVerified, hasChildProfile } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  if (!profile) return <CompleteProfileScreen />;
  if (!emailVerified) return <VerifyEmailScreen />;
  if (profile.role === 'Parent' && !hasChildProfile) return <OnboardingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
      <Stack.Screen name="Journal" component={ProgressJournalScreen} />
      <Stack.Screen name="Learn" component={KnowledgeHubScreen} />
      <Stack.Screen name="Toolkit" component={DailyToolkitScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="ManageChildren" component={ManageChildrenScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});