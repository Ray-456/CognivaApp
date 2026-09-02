import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/firebase/AuthContext';
import { ThemeProvider } from './src/theme/colors';
import RootNavigator from './src/navigation/RootNavigator';
import { AppErrorProvider } from './src/components/AppErrorBanner';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppErrorProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AppErrorProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
