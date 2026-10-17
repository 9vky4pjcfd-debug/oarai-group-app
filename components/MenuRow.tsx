import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function MenuRow({ title, description, href, icon }: { title: string; description?: string; href: Href; icon: IconName }) {
  return (
    <Pressable onPress={() => router.push(href)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}><Ionicons color={colors.accent} name={icon} size={24} /></View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 76, padding: spacing.md },
  pressed: { opacity: 0.72 },
  icon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radii.md, height: 44, justifyContent: 'center', width: 44 },
  copy: { flex: 1, gap: 2 },
  title: { ...typography.label, color: colors.text },
  description: { ...typography.caption, color: colors.textMuted },
});
