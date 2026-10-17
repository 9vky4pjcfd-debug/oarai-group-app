import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';

type BadgeTone = 'info' | 'success' | 'warning';

export function Badge({ label, tone = 'info' }: { label: string; tone?: BadgeTone }) {
  return <View style={[styles.base, styles[tone]]}><Text style={[styles.text, styles[`${tone}Text`]]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radii.pill },
  info: { backgroundColor: colors.accentSoft }, success: { backgroundColor: '#E3F4EE' }, warning: { backgroundColor: '#FFF0E2' },
  text: { ...typography.caption }, infoText: { color: colors.brand }, successText: { color: colors.success }, warningText: { color: colors.warning },
});
