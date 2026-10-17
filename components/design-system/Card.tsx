import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radii, shadows, spacing } from '@/constants';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.card },
});
