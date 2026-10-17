import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants';

export function PageHeader({ title, backLabel }: { title: string; backLabel: string }) {
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/(tabs)/home');
  return (
    <View style={styles.container}>
      <Pressable accessibilityLabel={backLabel} accessibilityRole="button" hitSlop={10} onPress={goBack} style={styles.back}>
        <Ionicons color={colors.brand} name="arrow-back" size={22} />
      </Pressable>
      <Text numberOfLines={1} style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.pill, height: 44, justifyContent: 'center', width: 44 },
  title: { ...typography.heading, color: colors.text, flex: 1, textAlign: 'center' },
  spacer: { height: 44, width: 44 },
});
