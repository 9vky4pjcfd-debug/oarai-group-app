import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/constants';

export function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <View style={styles.container}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.title}>{title}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxs }, eyebrow: { ...typography.caption, color: colors.accent, letterSpacing: 2 }, title: { ...typography.title, color: colors.text }, description: { ...typography.body, color: colors.textMuted },
});
