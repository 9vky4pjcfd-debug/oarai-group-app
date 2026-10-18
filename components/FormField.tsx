import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';

/** Labelled text input with an optional error line, used by every form in the app. */
export function FormField({ label, error, multiline, ...props }: TextInputProps & { label: string; error?: string | undefined }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput accessibilityLabel={label} multiline={multiline} placeholderTextColor={colors.textMuted} style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null]} {...props} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xxs },
  fieldLabel: { ...typography.caption, color: colors.textMuted },
  input: { ...typography.body, backgroundColor: colors.background, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, color: colors.text, minHeight: 48, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  inputError: { borderColor: colors.error },
  error: { ...typography.caption, color: colors.error },
});
