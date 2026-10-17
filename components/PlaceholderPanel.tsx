import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, Card } from '@/components/design-system';
import { colors, spacing, typography } from '@/constants';

export function PlaceholderPanel({ title, description, icon = 'construct-outline' }: { title: string; description: string; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <Card style={styles.card}>
      <View style={styles.icon}><Ionicons color={colors.accent} name={icon} size={32} /></View>
      <Badge label={title} />
      <Text style={styles.description}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  icon: { alignItems: 'center', justifyContent: 'center' },
  description: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
