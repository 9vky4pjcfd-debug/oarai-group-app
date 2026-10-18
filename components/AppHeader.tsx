import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radii, spacing } from '@/constants';
import { useHasUnreadNews } from '@/features/news/news-seen';

// Text wordmark until the group logo artwork is ready; the wave mark is the left end of the original logo.
export function AppHeader() {
  const { t } = useTranslation();
  const unread = useHasUnreadNews();
  return (
    <View style={styles.container}>
      <View accessibilityLabel="大洗グループ" accessibilityRole="header" style={styles.brand}>
        <View style={styles.mark}><Image source={require('@/assets/brand/logo.png')} contentFit="contain" style={styles.markImage} /></View>
        <View>
          <Text style={styles.name}>大洗グループ</Text>
          <Text style={styles.latin}>OARAI GROUP</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={unread ? `${t('news.title')}・${t('news.unread')}` : t('news.title')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push('/(tabs)/home/news')}
          style={styles.iconButton}>
          <Ionicons color={colors.brand} name="notifications-outline" size={22} />
          {unread ? <View style={styles.dot} /> : null}
        </Pressable>
        <Pressable
          accessibilityLabel={t('common.settings')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push('/account')}
          style={styles.iconButton}>
          <Ionicons color={colors.brand} name="settings-outline" size={22} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brand: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  mark: { height: 32, overflow: 'hidden', width: 29 },
  markImage: { height: 32, width: 203 },
  name: { color: colors.brand, fontSize: 18, fontWeight: '700', letterSpacing: 1, lineHeight: 22 },
  latin: { color: colors.accent, fontSize: 9, fontWeight: '600', letterSpacing: 2.5, lineHeight: 12 },
  actions: { flexDirection: 'row', gap: spacing.xs },
  iconButton: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.pill, height: 44, justifyContent: 'center', width: 44 },
  dot: { backgroundColor: colors.error, borderColor: colors.surface, borderRadius: radii.pill, borderWidth: 2, height: 12, position: 'absolute', right: 9, top: 9, width: 12 },
});
