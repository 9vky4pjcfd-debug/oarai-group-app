import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExternalLinkButton } from '@/components/ExternalLinkButton';
import { Badge, Button, Card, EmptyState, Screen, SectionHeader } from '@/components/design-system';
import { ContentGate } from '@/components/ContentGate';
import { PageHeader } from '@/components/PageHeader';
import { environmentConfig } from '@/config';
import { colors, radii, spacing, typography } from '@/constants';
import { useAllNotices, useHotels, useLocalized, useNotice } from '@/features/content';
import { filterNotices, type NoticeFilter } from '@/services/hotel/notice-utils';
import type { HotelPublicProfile } from '@/types';
import { NoticeRow } from './NoticeRow';
import { useNewsFormat } from './news-format';

export function useHotelMap() {
  const hotels = useHotels();
  const map = useMemo(() => new Map((hotels.data ?? []).map((hotel) => [hotel.hotelId, hotel])), [hotels.data]);
  return { hotels, map };
}

export function NewsListScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ hotelId?: string }>();
  const [filter, setFilter] = useState<NoticeFilter>(params.hotelId ?? 'all');
  const notices = useAllNotices();
  const { hotels, map } = useHotelMap();

  return (
    <Screen>
      <PageHeader title={t('news.title')} backLabel={t('common.back')} />
      <SectionHeader eyebrow={t('news.eyebrow')} title={t('news.title')} description={t('news.subtitle')} />
      {environmentConfig.backendMode === 'mock' ? <Badge label={t('news.sample')} /> : null}
      <FilterChips hotels={hotels.data ?? []} selected={filter} onSelect={setFilter} />
      <ContentGate state={notices} onRetry={notices.reload}>
        {(list) => {
          const visible = filterNotices(list, filter);
          return visible.length === 0
            ? <EmptyState title={t('news.empty')} />
            : <View style={styles.list}>{visible.map((notice) => <NoticeRow key={notice.noticeId} notice={notice} hotels={map} />)}</View>;
        }}
      </ContentGate>
    </Screen>
  );
}

function FilterChips({ hotels, selected, onSelect }: { hotels: HotelPublicProfile[]; selected: NoticeFilter; onSelect: (filter: NoticeFilter) => void }) {
  const { t } = useTranslation();
  const localize = useLocalized();
  const options: { id: NoticeFilter; label: string }[] = [
    { id: 'all', label: t('news.all') },
    { id: 'group', label: t('news.group') },
    ...hotels.map((hotel) => ({ id: hotel.hotelId, label: localize(hotel.name) })),
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {options.map((option) => {
        const active = option.id === selected;
        return (
          <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onSelect(option.id)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function NewsDetailScreen() {
  const { t } = useTranslation();
  const localize = useLocalized();
  const format = useNewsFormat();
  const { noticeId } = useLocalSearchParams<{ noticeId: string }>();
  const notice = useNotice(noticeId ?? '');
  const { map } = useHotelMap();

  return (
    <Screen>
      <PageHeader title={t('news.title')} backLabel={t('common.back')} />
      {notice.status === 'ready' && notice.data === null
        ? <EmptyState title={t('news.notFound')} />
        : (
          <ContentGate state={notice} onRetry={notice.reload}>
            {(item) => {
              const hotel = item.hotelId ? map.get(item.hotelId) : undefined;
              return (
                <Card style={styles.detail}>
                  <View style={styles.meta}>
                    <Text style={styles.date}>{format.date(item.publishedAt)}</Text>
                    <Badge label={t(`news.categories.${item.category}`)} tone={item.priority === 'important' ? 'warning' : 'info'} />
                  </View>
                  <Text style={styles.hotel}>{hotel ? localize(hotel.name) : t('news.groupWide')}</Text>
                  <Text style={styles.title}>{localize(item.title)}</Text>
                  <Text style={styles.body}>{localize(item.body)}</Text>
                  <ExternalLinkButton label={t('news.officialSite')} url={item.linkUrl} />
                </Card>
              );
            }}
          </ContentGate>
        )}
    </Screen>
  );
}

/** Home screen block: the newest few notices and a link to the full list. */
export function LatestNews({ limit = 3 }: { limit?: number }) {
  const { t } = useTranslation();
  const notices = useAllNotices();
  const { map } = useHotelMap();
  return (
    <>
      <SectionHeader eyebrow={t('news.eyebrow')} title={t('news.title')} />
      <ContentGate state={notices} onRetry={notices.reload}>
        {(list) => list.length === 0
          ? <EmptyState title={t('news.empty')} />
          : <View style={styles.list}>{list.slice(0, limit).map((notice) => <NoticeRow key={notice.noticeId} notice={notice} hotels={map} />)}</View>}
      </ContentGate>
      <Button label={t('news.viewAll')} variant="ghost" onPress={() => router.push('/(tabs)/home/news')} />
    </>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  chips: { gap: spacing.xs },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipLabel: { ...typography.label, color: colors.text },
  chipLabelActive: { color: colors.white },
  detail: { gap: spacing.sm },
  meta: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  date: { ...typography.caption, color: colors.textMuted },
  hotel: { ...typography.caption, color: colors.brand },
  title: { ...typography.heading, color: colors.text },
  body: { ...typography.body, color: colors.text },
});
