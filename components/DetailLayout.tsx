import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/design-system';
import { colors, radii, spacing, typography } from '@/constants';

export function DetailLayout({ title, description, image, children }: React.PropsWithChildren<{ title: string; description: string; image?: ImageSource | number | undefined }>) {
  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {image ? <Image contentFit="cover" source={image} style={styles.absolute} /> : null}
        <View style={styles.overlay} />
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons color={colors.white} name="arrow-back" size={22} /></Pressable>
        <View style={styles.heroCopy}><Text style={styles.title}>{title}</Text></View>
      </View>
      <Text style={styles.description}>{description}</Text>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  hero: { backgroundColor: colors.brand, borderRadius: radii.lg, height: 300, justifyContent: 'space-between', overflow: 'hidden', padding: spacing.md },
  absolute: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  overlay: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, backgroundColor: colors.overlay },
  back: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radii.pill, height: 44, justifyContent: 'center', width: 44 },
  heroCopy: { justifyContent: 'flex-end' },
  title: { ...typography.title, color: colors.white },
  description: { ...typography.body, color: colors.text },
});
