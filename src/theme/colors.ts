import React, { createContext, useContext, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = {
  bg: string;
  surface: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  primary: string;
  primarySoft: string;
  teal: string;
  tealSoft: string;
  coral: string;
  coralSoft: string;
  border: string;
  divider: string;
  shadow: string;
};

// Cogniva design tokens — v2: sleeker, modern, restrained.
// One confident accent (indigo, drawn from the logo) instead of five
// competing colors. Teal and coral survive only as small, purposeful accents.
export const lightColors: AppTheme = {
  bg: '#F3F5F9',
  surface: '#FFFFFF',
  ink: '#172033',
  inkSoft: '#4B5565',
  inkFaint: '#667085',

  primary: '#4C3FD6',
  primarySoft: '#E5E2FF',
  teal: '#0F766E',
  tealSoft: '#D8F3EE',
  coral: '#C2410C',
  coralSoft: '#FFEEE8',

  border: '#D5D9E2',
  divider: '#E5E7EB',
  shadow: 'rgba(23,32,51,0.10)',
};

export const darkColors: AppTheme = {
  bg: '#0B1220',
  surface: '#151F33',
  ink: '#F8FAFC',
  inkSoft: '#D3DCEB',
  inkFaint: '#AAB8CC',

  primary: '#6B5BDB',
  primarySoft: '#2C285A',
  teal: '#5EEAD4',
  tealSoft: '#123F3D',
  coral: '#FF9A76',
  coralSoft: '#4A261D',

  border: '#334155',
  divider: '#263248',
  shadow: 'rgba(2,6,23,0.4)',
};

export const colors = lightColors;

export const spacing = { xs: 6, sm: 12, md: 20, lg: 28, xl: 44 };
export const radii = { sm: 10, md: 16, lg: 22, pill: 100 };

const THEME_STORAGE_KEY = 'cogniva.darkMode';

export const createTypography = (themeColors: AppTheme) => ({
  display: { fontSize: 26, fontWeight: '700' as const, color: themeColors.ink, letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '700' as const, color: themeColors.ink, letterSpacing: -0.2 },
  body: { fontSize: 15, color: themeColors.inkSoft, lineHeight: 21 },
  caption: { fontSize: 12.5, color: themeColors.inkFaint, fontWeight: '600' as const },
});

export const typography = createTypography(lightColors);

type ThemeContextValue = {
  isDark: boolean;
  colors: AppTheme;
  typography: ReturnType<typeof createTypography>;
  toggleTheme: () => void;
  setTheme: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightColors,
  typography: createTypography(lightColors),
  toggleTheme: () => undefined,
  setTheme: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
      if (savedTheme !== null) setIsDark(savedTheme === 'true');
    });
  }, []);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const typography = useMemo(() => createTypography(colors), [colors]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, String(next));
      return next;
    });
  };
  const setTheme = (value: boolean) => {
    setIsDark(value);
    AsyncStorage.setItem(THEME_STORAGE_KEY, String(value));
  };

  const value = useMemo(() => ({ isDark, colors, typography, toggleTheme, setTheme }), [isDark, colors, typography]);

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
