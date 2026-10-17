import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExternalLinkButton } from '@/components/ExternalLinkButton';
import { ContentGate } from '@/components/ContentGate';
import { DetailLayout } from '@/components/DetailLayout';
import { Badge, Button, Card, Screen, SectionHeader } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, DEFAULT_HOTEL_ID, spacing, typography } from '@/constants';
import { MenuRow } from '@/components/MenuRow';
import { useHotel, useLocalized } from '@/features/content';
import { resolveContentImage } from '@/features/hotel/content-utils';
import { HotelRooms } from '@/features/rooms/RoomsScreen';

export function HotelDetailScreen() {
  const { hotelId = '' } = useLocalSearchParams<{ hotelId: string }>();
  const { t } = useTranslation();
  const l = useLocalized();
  const hotel = useHotel(hotelId);

  if (hotel.status !== 'ready' || !hotel.data) {
    return <Screen><PageHeader title={t('hotels.about')} backLabel={t('common.back')} /><ContentGate state={hotel} onRetry={hotel.reload}>{() => null}</ContentGate></Screen>;
  }

  const data = hotel.data;
  const info = [
    data.address && { label: t('hotels.address'), value: l(data.address) },
    data.phone && { label: t('hotels.phone'), value: data.phone },
    data.checkInTime && { label: t('hotels.checkIn'), value: data.checkInTime },
    data.checkOutTime && { label: t('hotels.checkOut'), value: data.checkOutTime },
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <DetailLayout image={data.heroImage ? resolveContentImage(data.heroImage) : undefined} title={l(data.name)} description={l(data.description)}>
      <View style={styles.badges}>{data.highlights.map((item, index) => <Badge key={index} label={l(item)} />)}</View>
      {info.length > 0 ? (
        <Card style={styles.card}>
          {info.map((item) => <View key={item.label} style={styles.info}><Text style={styles.label}>{item.label}</Text><Text style={styles.value}>{item.value}</Text></View>)}
        </Card>
      ) : null}
      <Button label={t('hotels.reserve')} onPress={() => router.push({ pathname: '/(tabs)/stay/reservation', params: { hotelId: data.hotelId } })} />
      <ExternalLinkButton label={t('hotels.website')} url={data.websiteUrl} />
      {data.hotelId === DEFAULT_HOTEL_ID ? <MenuRow icon="pulse-outline" title={t('home.liveTitle')} description={t('facilities.crowdDescription')} href="/(tabs)/facilities/crowd" /> : null}
      <SectionHeader title={t('hotels.rooms')} />
      <HotelRooms hotelId={data.hotelId} limit={4} />
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  card: { gap: spacing.sm },
  info: { gap: spacing.xxs },
  label: { ...typography.caption, color: colors.textMuted },
  value: { ...typography.body, color: colors.text },
});
