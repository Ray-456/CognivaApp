import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useChild } from '../firebase/ChildContext';
import { radii, spacing, useTheme } from '../theme/colors';

export default function ChildSwitcher() {
  const { children, selectedChild, selectChild } = useChild();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  if (children.length === 0) return null;

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Choose child profile"
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.label, { color: colors.inkFaint }]}>VIEWING</Text>
        <Text style={[styles.name, { color: colors.ink }]}>{selectedChild?.name ?? 'Choose child'}⌄</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.ink }]}>Choose a child</Text>
            {children.map((child) => {
              const active = child.id === selectedChild?.id;
              return (
                <TouchableOpacity
                  key={child.id}
                  onPress={async () => {
                    await selectChild(child.id);
                    setOpen(false);
                  }}
                  style={[styles.option, { borderColor: colors.border }, active && { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}
                >
                  <Text style={[styles.optionText, { color: colors.ink }, active && { color: colors.primary }]}>{child.name}</Text>
                  {active && <Text style={[styles.check, { color: colors.primary }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { borderWidth: 1, borderRadius: radii.md, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start' },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  name: { fontSize: 13, fontWeight: '700', marginTop: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.28)', justifyContent: 'center', padding: spacing.lg },
  menu: { borderRadius: radii.lg, padding: spacing.md },
  title: { fontSize: 17, fontWeight: '700', marginBottom: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.sm },
  optionText: { fontSize: 15, fontWeight: '600' },
  check: { fontSize: 17, fontWeight: '800' },
});