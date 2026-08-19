import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/firebase/AuthContext';
import { ThemeProvider } from './src/theme/colors';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}
