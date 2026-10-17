import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/design-system';
import { colors, radii, spacing, typography } from '@/constants';
import { useLocalized } from '@/features/content';
import type { HotelPublicProfile, Notice } from '@/types';
import { useNewsFormat } from './news-format';

/** One notice in a list: date, hotel, category and title. */
export function NoticeRow({ notice, hotels }: { notice: Notice; hotels: ReadonlyMap<string, HotelPublicProfile> }) {
  const { t } = useTranslation();
  const localize = useLocalized();
  const format = useNewsFormat();
  const hotel = notice.hotelId ? hotels.get(notice.hotelId) : undefined;
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push({ pathname: '/(tabs)/home/news/[noticeId]', params: { noticeId: notice.noticeId } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.meta}>
        <Text style={styles.date}>{format.date(notice.publishedAt)}</Text>
        {notice.priority === 'important' ? <Badge label={t('news.important')} tone="warning" /> : <Badge label={t(`news.categories.${notice.category}`)} />}
      </View>
      <Text style={styles.hotel}>{hotel ? localize(hotel.name) : t('news.groupWide')}</Text>
      <Text numberOfLines={2} style={styles.title}>{localize(notice.title)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, gap: spacing.xxs, padding: spacing.md },
  pressed: { opacity: 0.78 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  date: { ...typography.caption, color: colors.textMuted },
  hotel: { ...typography.caption, color: colors.brand },
  title: { ...typography.label, color: colors.text },
});
