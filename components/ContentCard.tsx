import { Image, type ImageSource } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';

export function ContentCard({ image, title, description, meta, href }: { image?: ImageSource | number | undefined; title: string; description: string; meta?: string; href: Href }) {
  return (
    <Pressable onPress={() => router.push(href)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
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
  image: { aspectRatio: 16 / 9, width: '100%' },
  body: { gap: spacing.xs, padding: spacing.md },
  meta: { ...typography.caption, color: colors.accent, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.text },
  description: { ...typography.body, color: colors.textMuted },
});
