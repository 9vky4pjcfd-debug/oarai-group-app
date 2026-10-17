import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radii, spacing, typography } from '@/constants';

export function Stepper({ label, note, value, min, max, onChange }: { label: string; note?: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      <StepButton disabled={value <= min} icon="remove" label={`${label} ${t('booking.decrease')}`} onPress={() => onChange(value - 1)} />
      <Text accessibilityLiveRegion="polite" style={styles.value}>{value}</Text>
      <StepButton disabled={value >= max} icon="add" label={`${label} ${t('booking.increase')}`} onPress={() => onChange(value + 1)} />
    </View>
  );
}

function StepButton({ icon, label, disabled, onPress }: { icon: 'add' | 'remove'; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} hitSlop={6} onPress={onPress} style={[styles.button, disabled && styles.disabled]}>
      <Ionicons color={colors.brand} name={icon} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, minHeight: 52 },
  copy: { flex: 1 },
  label: { ...typography.label, color: colors.text },
  note: { ...typography.caption, color: colors.textMuted },
  button: { alignItems: 'center', borderColor: colors.accent, borderRadius: radii.pill, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  disabled: { opacity: 0.3 },
  value: { ...typography.heading, color: colors.text, minWidth: 28, textAlign: 'center' },
});
