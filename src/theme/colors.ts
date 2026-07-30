import React, { createContext, useContext, useMemo, useState } from 'react';

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
  bg: '#F7F7FB',
  surface: '#FFFFFF',
  ink: '#14181F',
  inkSoft: '#6B7280',
  inkFaint: '#9CA3AF',

  primary: '#5B4FE0',
  primarySoft: '#EEECFC',
  teal: '#2F6F63',
  tealSoft: '#E4F0EC',
  coral: '#E4572E',
  coralSoft: '#FCE7E0',

  border: '#E8E9EE',
  divider: '#EFEFF3',
  shadow: 'rgba(20,24,31,0.06)',
};

export const darkColors: AppTheme = {
  bg: '#0F172A',
  surface: '#111C32',
  ink: '#F8FAFC',
  inkSoft: '#CBD5E1',
  inkFaint: '#94A3B8',

  primary: '#8B7CFF',
  primarySoft: '#1E2A5A',
  teal: '#4FD1C5',
  tealSoft: '#173B39',
  coral: '#FB923C',
  coralSoft: '#4A2A16',

  border: '#243447',
  divider: '#1F2B3D',
  shadow: 'rgba(2,6,23,0.4)',
};

export const colors = lightColors;

export const spacing = { xs: 6, sm: 12, md: 20, lg: 28, xl: 44 };
export const radii = { sm: 10, md: 16, lg: 22, pill: 100 };

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
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const typography = useMemo(() => createTypography(colors), [colors]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setTheme = (value: boolean) => setIsDark(value);

  const value = useMemo(() => ({ isDark, colors, typography, toggleTheme, setTheme }), [isDark, colors, typography]);

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
