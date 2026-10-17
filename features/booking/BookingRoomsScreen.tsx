import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { environmentConfig } from '@/config';
import { ContentGate } from '@/components/ContentGate';
import { PageHeader } from '@/components/PageHeader';
import { Badge, Card, EmptyState, Screen, SectionHeader } from '@/components/design-system';
import { colors, radii, spacing, typography } from '@/constants';
import { useHotel, useLocalized } from '@/features/content';
import { resolveContentImage } from '@/features/hotel/content-utils';
import { formatCapacity } from '@/features/rooms/room-format';
import { daysBetween } from '@/services/booking/booking-rules';
import type { RoomOffer, StaySearch } from '@/types';
import { parseStayParams, toStayParams, useBookingFormat, useRoomOffers, type StayParams } from './booking';
import { StaySummary } from './StaySummary';

/** Low stock is shown from this many rooms left. */
const LOW_STOCK = 2;

/** Step 2: room types that fit the party, with availability and the total for the stay. */
export function BookingRoomsScreen() {
  const { t } = useTranslation();
  const l = useLocalized();
  const params = useLocalSearchParams<StayParams>();
  const search = parseStayParams(params);
  const hotel = useHotel(search?.hotelId ?? '');
  const offers = useRoomOffers(search);

  if (!search) return <Screen><PageHeader title={t('booking.roomsTitle')} backLabel={t('common.back')} /><EmptyState title={t('state.empty')} /></Screen>;

  // The room chosen on a room page goes first, so the guest finds it without scrolling.
  const ordered = (list: RoomOffer[]) => [...list].sort((a, b) => Number(b.roomId === params.roomId) - Number(a.roomId === params.roomId));

  return (
    <Screen>
      <PageHeader title={t('booking.title')} backLabel={t('common.back')} />
      <SectionHeader eyebrow={t('booking.stepRoom')} title={t('booking.roomsTitle')} />
      {environmentConfig.backendMode === 'mock' ? <Badge label={t('booking.demoNotice')} tone="warning" /> : null}
      <Card style={styles.summary}>
        <StaySummary search={search} hotelName={hotel.data ? l(hotel.data.name) : undefined} />
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.back()}><Text style={styles.change}>{t('booking.change')}</Text></Pressable>
      </Card>
      <ContentGate state={offers} onRetry={offers.reload}>
        {(list) => list.length === 0
          ? <EmptyState title={t('booking.noRooms')} />
          : <View style={styles.list}>{ordered(list).map((offer) => <OfferCard key={offer.roomId} offer={offer} search={search} highlighted={offer.roomId === params.roomId} />)}</View>}
      </ContentGate>
    </Screen>
  );
}

function OfferCard({ offer, search, highlighted }: { offer: RoomOffer; search: StaySearch; highlighted: boolean }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const format = useBookingFormat();
  const soldOut = offer.remaining < 1;
  const notEnough = !soldOut && offer.remaining < search.rooms;
  const unavailable = soldOut || notEnough;
  const nights = daysBetween(search.checkIn, search.checkOut);
  const image = offer.room.images[0];
  const open = () => router.push({ pathname: '/(tabs)/stay/booking/confirm', params: toStayParams(search, offer.roomId) });

  return (
    <Pressable
      accessibilityLabel={`${l(offer.room.name)} ${unavailable ? t('booking.soldOut') : format.yen(offer.totalAmount)}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable }}
      disabled={unavailable}
      onPress={open}
      style={({ pressed }) => [styles.card, highlighted && styles.highlighted, unavailable && styles.soldOut, pressed && styles.pressed]}>
      {image ? <Image contentFit="cover" source={resolveContentImage(image)} style={styles.image} transition={180} /> : <View style={[styles.image, styles.placeholder]}><Ionicons color={colors.white} name="bed-outline" size={28} /></View>}
      <View style={styles.body}>
        {highlighted ? <Badge label={t('booking.selectedRoom')} /> : null}
        <Text style={styles.meta}>{`${l(offer.room.roomSize)} · ${formatCapacity(offer.room, t)}`}</Text>
        <Text style={styles.title}>{l(offer.room.name)}</Text>
        <View style={styles.footer}>
          {soldOut ? <Badge label={t('booking.soldOut')} tone="warning" /> : notEnough ? <Badge label={t('booking.notEnoughRooms', { count: offer.remaining })} tone="warning" /> : (
            <View style={styles.price}>
              <Text style={styles.caption}>{t('booking.totalFor', { nights: search.rooms > 1 ? `${t('booking.nights', { count: nights })}・${format.rooms(search.rooms)}` : t('booking.nights', { count: nights }) })}</Text>
              <Text style={styles.total}>{format.yen(offer.totalAmount)}</Text>
              {nights > 1 ? <Text style={styles.caption}>{t('booking.perNight', { amount: format.yen(Math.round(offer.totalAmount / nights)) })}</Text> : null}
            </View>
          )}
          {!unavailable && offer.remaining <= LOW_STOCK ? <Badge label={t('booking.remaining', { count: offer.remaining })} tone="warning" /> : null}
        </View>
        {!unavailable ? <View style={styles.cta}><Text style={styles.ctaLabel}>{t('booking.select')}</Text><Ionicons color={colors.brand} name="chevron-forward" size={18} /></View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  change: { ...typography.label, color: colors.accent },
  list: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, overflow: 'hidden' },
  highlighted: { borderColor: colors.accent, borderWidth: 2 },
  soldOut: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  image: { aspectRatio: 16 / 7, width: '100%' },
  placeholder: { alignItems: 'center', backgroundColor: colors.brand, justifyContent: 'center' },
  body: { gap: spacing.xs, padding: spacing.md },
  meta: { ...typography.caption, color: colors.accent, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.text },
  footer: { alignItems: 'flex-end', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  price: { flex: 1, gap: 2 },
  caption: { ...typography.caption, color: colors.textMuted },
  total: { ...typography.title, color: colors.brand },
  cta: { alignItems: 'center', alignSelf: 'flex-end', flexDirection: 'row', gap: 2 },
  ctaLabel: { ...typography.label, color: colors.brand },
});
