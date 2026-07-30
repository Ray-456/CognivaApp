import React from 'react';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import { ThemeProvider, useTheme } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/firebase/AuthContext';

import RoleSelectScreen from './src/screens/RoleSelectScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import CompleteProfileScreen from './src/screens/CompleteProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainTabs from './src/navigation/MainTabs';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PostCommentsScreen from './src/screens/PostCommentsScreen';
import ManageChildrenScreen from './src/screens/ManageChildrenScreen';
import AddChildScreen from './src/screens/AddChildScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { isDark, colors } = useTheme();
  const { user, profile, loading, emailVerified, hasChildProfile } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Signed in but hasn't clicked the verification link yet — nothing else
  // is reachable until this passes. (Google accounts arrive pre-verified.)
  const needsVerification = user && !emailVerified;

  // Signed in and verified, but no Firestore profile doc exists yet — this
  // is a brand-new Google sign-up, since Google doesn't tell us their role.
  const needsProfile = user && emailVerified && !profile;

  // Signed in, verified, has a profile, but a Parent account hasn't
  // finished the mandatory child profile yet.
  const needsChildProfile = user && emailVerified && profile?.role === 'Parent' && !hasChildProfile;

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : needsVerification ? (
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        ) : needsProfile ? (
          <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        ) : needsChildProfile ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
            <Stack.Screen name="AIAssistant" component={AIAssistantScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PostComments" component={PostCommentsScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="ManageChildren" component={ManageChildrenScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="AddChild" component={AddChildScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
