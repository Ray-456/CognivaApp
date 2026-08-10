import React from 'react';
import { registerRootComponent } from 'expo';
import AppRoot from './src/screens/HomeScreen';

// If you have an existing root component elsewhere, replace the import above.

export default function App() {
  return <AppRoot />;
}

registerRootComponent(App);
