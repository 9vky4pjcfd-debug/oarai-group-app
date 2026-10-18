import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';

/** `compact` is a thumbnail row for long lists (rooms, facilities) so guests can scan many items without endless scrolling. */
export function ContentCard({ image, title, description, meta, href, compact = false }: { image?: ImageSource | number | undefined; title: string; description: string; meta?: string; href: Href; compact?: boolean }) {
  if (compact) {
    return (
      <Pressable accessibilityRole="link" onPress={() => router.push(href)} style={({ pressed }) => [styles.card, styles.row, pressed && styles.pressed]}>
        <View style={styles.thumb}>
          {image ? <Image contentFit="cover" source={image} style={styles.fill} transition={180} /> : <Ionicons color={colors.accent} name="image-outline" size={28} />}
        </View>
        <View style={styles.rowBody}>
          {meta ? <Text numberOfLines={1} style={styles.meta}>{meta}</Text> : null}
          <Text numberOfLines={2} style={styles.rowTitle}>{title}</Text>
          <Text numberOfLines={2} style={styles.rowDescription}>{description}</Text>
        </View>
        <Ionicons color={colors.textMuted} name="chevron-forward" size={18} style={styles.chevron} />
      </Pressable>
    );
  }
  return (
    <Pressable accessibilityRole="link" onPress={() => router.push(href)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {image ? <Image contentFit="cover" source={image} style={styles.image} transition={180} /> : null}
      <View style={styles.body}>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={3} style={styles.description}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, overflow: 'hidden' },
  pressed: { opacity: 0.8 },
  // The tinted background shows while a photo loads, or if a remote photo cannot be reached.
  image: { aspectRatio: 16 / 9, backgroundColor: colors.accentSoft, width: '100%' },
  body: { gap: spacing.xs, padding: spacing.md },
  meta: { ...typography.caption, color: colors.accent, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.text },
  description: { ...typography.body, color: colors.textMuted },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, padding: spacing.xs },
  thumb: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radii.md, height: 96, justifyContent: 'center', overflow: 'hidden', width: 104 },
  fill: { height: '100%', width: '100%' },
  rowBody: { flex: 1, gap: 2, paddingVertical: spacing.xxs },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  rowDescription: { ...typography.caption, color: colors.textMuted },
  chevron: { marginRight: spacing.xxs },
});
