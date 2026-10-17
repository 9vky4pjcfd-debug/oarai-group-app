import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading = false, disabled, style, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [styles.base, styles[variant], state.pressed && styles.pressed, disabled && styles.disabled, typeof style === 'function' ? style(state) : style]}
      {...props}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.brand} /> : <Text style={[styles.label, variant !== 'primary' && styles.altLabel]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent },
  ghost: { backgroundColor: 'transparent' },
  label: { ...typography.label, color: colors.white },
  altLabel: { color: colors.brand },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.45 },
});
