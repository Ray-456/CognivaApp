import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/colors';

export type AppErrorSeverity = 'error' | 'warning' | 'info';

export type AppError = {
  id: number;
  title: string;
  message: string;
  severity?: AppErrorSeverity;
};

type AppErrorContextValue = {
  showError: (error: Omit<AppError, 'id'>) => void;
  clearError: () => void;
  error: AppError | null;
};

const AppErrorContext = createContext<AppErrorContextValue | undefined>(undefined);

export function AppErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 7000);
    return () => clearTimeout(timer);
  }, [error]);

  const showError = useCallback((next: Omit<AppError, 'id'>) => {
    setError({ ...next, id: Date.now() + Math.random() });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(() => ({ error, showError, clearError }), [error, showError, clearError]);

  return (
    <AppErrorContext.Provider value={value}>
      {children}
      {error ? <AppErrorBanner error={error} onDismiss={clearError} /> : null}
    </AppErrorContext.Provider>
  );
}

export function useAppError() {
  const context = useContext(AppErrorContext);
  if (!context) throw new Error('useAppError must be used within AppErrorProvider');
  return context;
}

export function normalizeAppError(error: any, fallbackTitle = 'Something went wrong'): Omit<AppError, 'id'> {
  const message = typeof error?.message === 'string' ? error.message : 'Please try again.';
  const code = typeof error?.code === 'string' ? error.code : '';
  const text = `${code} ${message}`.toLowerCase();

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      title: 'No internet connection',
      message: 'Check your connection and try again.',
      severity: 'warning',
    };
  }

  if (/wrong-password|invalid-login-credentials|email-already-in-use|weak-password|user-not-found|requires-recent-login|password/.test(text)) {
    return {
      title: 'Authentication problem',
      message: message || 'Please check your details and try again.',
      severity: 'error',
    };
  }

  if (/network|fetch|offline|failed to fetch|load failed|connection|timeout|unreachable|blocked by CORS/.test(text)) {
    return {
      title: 'No internet connection',
      message: 'We could not reach the server. Please check your internet and try again.',
      severity: 'warning',
    };
  }

  if (/internal server|server error|500|unexpected|unavailable|temporar|service/.test(text)) {
    return {
      title: 'Server issue',
      message: 'Something went wrong on our side. Please try again in a moment.',
      severity: 'warning',
    };
  }

  return {
    title: fallbackTitle,
    message,
    severity: 'error',
  };
}

function AppErrorBanner({ error, onDismiss }: { error: AppError; onDismiss: () => void }) {
  const { colors } = useTheme();
  const accentColor = error.severity === 'warning' ? colors.coral : error.severity === 'info' ? colors.primary : '#D93B3B';

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: accentColor, shadowColor: colors.shadow }]}>
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{error.severity === 'warning' ? '!' : '×'}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.ink }]}>{error.title}</Text>
          <Text style={[styles.message, { color: colors.inkSoft }]}>{error.message}</Text>
        </View>

        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.close, { color: colors.inkSoft }]}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  message: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  close: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 10,
  },
});
