import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '@/constants';

/** Back navigation for sub-pages. The page's own SectionHeader carries the title, so it is not repeated here. */
export function PageHeader({ backLabel }: { title?: string; backLabel: string }) {
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/(tabs)/home');
  return (
    <View style={styles.container}>
      <Pressable accessibilityLabel={backLabel} accessibilityRole="button" hitSlop={10} onPress={goBack} style={styles.back}>
        <Ionicons color={colors.brand} name="arrow-back" size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row' },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.pill, height: 44, justifyContent: 'center', width: 44 },
});
