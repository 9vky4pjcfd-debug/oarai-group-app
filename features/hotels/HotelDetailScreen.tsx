import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExternalLinkButton } from '@/components/ExternalLinkButton';
import { ContentGate } from '@/components/ContentGate';
import { DetailLayout } from '@/components/DetailLayout';
import { Badge, Button, Card, Screen, SectionHeader } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, DEFAULT_HOTEL_ID, radii, spacing, typography } from '@/constants';
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
  // Address opens the map app and the phone number dials, so guests can act on them in one tap.
  const info: InfoItem[] = [
    data.address && { label: t('hotels.address'), value: l(data.address), url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l(data.address))}`, icon: 'navigate-outline' as const, action: t('hotels.openMap') },
    data.phone && { label: t('hotels.phone'), value: data.phone, url: `tel:${data.phone.replace(/[^\d+]/g, '')}`, icon: 'call-outline' as const, action: t('ui.callHotel') },
    data.checkInTime && { label: t('hotels.checkIn'), value: data.checkInTime },
    data.checkOutTime && { label: t('hotels.checkOut'), value: data.checkOutTime },
  ].flatMap((item): InfoItem[] => (item ? [item] : []));

  return (
    <DetailLayout image={data.heroImage ? resolveContentImage(data.heroImage) : undefined} title={l(data.name)} description={l(data.description)}>
      <View style={styles.badges}>{data.highlights.map((item, index) => <Badge key={index} label={l(item)} />)}</View>
      {info.length > 0 ? (
        <Card style={styles.card}>
          {info.map((item) => <InfoRow key={item.label} item={item} />)}
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

type InfoItem = { label: string; value: string; url?: string; icon?: React.ComponentProps<typeof Ionicons>['name']; action?: string };

function InfoRow({ item }: { item: InfoItem }) {
  const content = (
    <>
      <View style={styles.infoCopy}><Text style={styles.label}>{item.label}</Text><Text style={styles.value}>{item.value}</Text></View>
      {item.icon ? <View style={styles.infoAction}><Ionicons color={colors.brand} name={item.icon} size={20} /></View> : null}
    </>
  );
  if (!item.url) return <View style={styles.info}>{content}</View>;
  const url = item.url;
  return <Pressable accessibilityHint={item.action} accessibilityRole="link" onPress={() => void Linking.openURL(url)} style={({ pressed }) => [styles.info, pressed && styles.pressed]}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  card: { gap: spacing.sm },
  info: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  infoCopy: { flex: 1, gap: spacing.xxs },
  infoAction: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radii.pill, height: 40, justifyContent: 'center', width: 40 },
  pressed: { opacity: 0.7 },
  label: { ...typography.caption, color: colors.textMuted },
  value: { ...typography.body, color: colors.text },
});
