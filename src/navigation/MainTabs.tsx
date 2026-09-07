import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/colors';
import Icon, { IconName } from '../components/Icon';
import { useAuth } from '../firebase/AuthContext';

import CommunityScreen from '../screens/CommunityScreen';
import HomeScreen from '../screens/HomeScreen';
import KnowledgeHubScreen from '../screens/KnowledgeHubScreen';
import DailyToolkitScreen from '../screens/DailyToolkitScreen';
import ProgressJournalScreen from '../screens/ProgressJournalScreen';
import MyClientsScreen from '../screens/MyClientsScreen';

const Tab = createBottomTabNavigator();

const tabIcon = (iconName: IconName) => ({ color }: { color: string }) => (
  <Icon name={iconName} size={20} color={color} />
);

export default function MainTabs() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const isProfessional = profile?.role === 'Therapist' || profile?.role === 'Psychologist';

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.divider, height: 58, paddingBottom: 6, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon('home') }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarIcon: tabIcon('community') }} />
      <Tab.Screen name="Learn" component={KnowledgeHubScreen} options={{ tabBarIcon: tabIcon('book') }} />
      {isProfessional ? (
        <Tab.Screen name="MyClients" component={MyClientsScreen} options={{ tabBarIcon: tabIcon('community'), tabBarLabel: 'Clients' }} />
      ) : (
        <>
          <Tab.Screen name="Toolkit" component={DailyToolkitScreen} options={{ tabBarIcon: tabIcon('lightning') }} />
          <Tab.Screen name="Journal" component={ProgressJournalScreen} options={{ tabBarIcon: tabIcon('chart') }} />
        </>
      )}
    </Tab.Navigator>
  );
}
