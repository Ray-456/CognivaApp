import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import { spacing, radii, useTheme } from '../theme/colors';

type Phase = 'ready' | 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_DURATIONS: Record<Exclude<Phase, 'ready'>, number> = {
  inhale: 4000,
  hold1: 4000,
  exhale: 4000,
  hold2: 4000,
};

const PHASE_LABELS: Record<Phase, string> = {
  ready: "Tap start when you're ready",
  inhale: 'Breathe in...',
  hold1: 'Hold...',
  exhale: 'Breathe out...',
  hold2: 'Hold...',
};

const PHASE_ORDER: Exclude<Phase, 'ready'>[] = ['inhale', 'hold1', 'exhale', 'hold2'];

export default function BreathingExerciseScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('ready');
  const [running, setRunning] = useState(false);
  const scale = useRef(new Animated.Value(0.6)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runPhase = (index: number) => {
    const currentPhase = PHASE_ORDER[index % PHASE_ORDER.length];
    setPhase(currentPhase);

    const targetScale = currentPhase === 'inhale' ? 1 : currentPhase === 'exhale' ? 0.6 : undefined;
    if (targetScale !== undefined) {
      Animated.timing(scale, {
        toValue: targetScale,
        duration: PHASE_DURATIONS[currentPhase],
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }

    timerRef.current = setTimeout(() => runPhase(index + 1), PHASE_DURATIONS[currentPhase]);
  };

  const start = () => {
    setRunning(true);
    runPhase(0);
  };

  const stop = () => {
    setRunning(false);
    setPhase('ready');
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(scale, { toValue: 0.6, duration: 400, useNativeDriver: true }).start();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.circle,
            { backgroundColor: colors.tealSoft, borderColor: colors.teal, transform: [{ scale }] },
          ]}
        />
        <Text style={[styles.phaseLabel, { color: colors.ink }]}>{PHASE_LABELS[phase]}</Text>
        <Text style={[styles.helperText, { color: colors.inkSoft }]}>
          Box breathing — in for 4, hold for 4, out for 4, hold for 4.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: running ? colors.coral : colors.primary }]}
          onPress={running ? stop : start}
        >
          <Text style={styles.buttonText}>{running ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: 0 },
  back: { fontWeight: '600', fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  circle: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, marginBottom: spacing.xl },
  phaseLabel: { fontSize: 22, fontWeight: '700', marginBottom: spacing.xs, textAlign: 'center' },
  helperText: { fontSize: 14, textAlign: 'center', marginBottom: spacing.xl },
  button: { borderRadius: radii.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
