import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { PageHeader } from '@/components/PageHeader';
import { Badge, Button, EmptyState, Screen } from '@/components/design-system';
import { colors, radii, spacing, typography } from '@/constants';
import { useHotels, useLocalized, useRoom } from '@/features/content';
import { SignInPrompt } from '@/features/auth/SignInPrompt';
import { useMemberIdentity } from '@/features/member/membership';
import { services } from '@/services';
import type { HotelPublicProfile, ReservationDocument } from '@/types';
import { useBookingFormat, useOwnReservations } from './booking';
import { ReservationStatusBadge } from './ReservationStatusBadge';

/** Every reservation of the member across the group, upcoming first. */
export function MyReservationsScreen() {
  const { t } = useTranslation();
  const identity = useMemberIdentity();
  const reservations = useOwnReservations(identity.userId);
  const hotels = useHotels();
  const today = services.reservations.today();

  // Coming back from a detail page (after a cancellation, for example) should show the latest state.
  const focused = useRef(false);
  const { reload } = reservations;
  useFocusEffect(useCallback(() => {
    if (focused.current) reload();
    focused.current = true;
  }, [reload]));

  const header = <><PageHeader title={t('booking.myReservations')} backLabel={t('common.back')} /><Text style={styles.description}>{t('booking.myReservationsDescription')}</Text></>;
  if (identity.status === 'signed-out') return <Screen>{header}<SignInPrompt title={t('booking.myReservations')} description={t('booking.signInRequired')} redirect="/(tabs)/stay/booking/reservations" /></Screen>;

  const hotelById = new Map((hotels.data ?? []).map((hotel) => [hotel.hotelId, hotel]));
  return (
    <Screen>
      {header}
      {identity.isDemo ? <Badge label={t('member.demoMember')} /> : null}
      <ContentGate state={reservations} onRetry={reservations.reload}>
        {(list) => {
          if (list.length === 0) return <View style={styles.empty}><EmptyState title={t('booking.empty')} message={t('booking.emptyMessage')} /><Button label={t('booking.bookNow')} onPress={() => router.push('/(tabs)/stay/reservation')} /></View>;
          const upcoming = list.filter((item) => item.status !== 'cancelled' && item.checkOut >= today);
          const past = list.filter((item) => !upcoming.includes(item));
          return (
            <>
              {upcoming.length > 0 ? <Group title={t('booking.upcoming')} items={upcoming} hotels={hotelById} /> : null}
              {past.length > 0 ? <Group title={t('booking.past')} items={past} hotels={hotelById} /> : null}
            </>
          );
        }}
      </ContentGate>
    </Screen>
  );
}

function Group({ title, items, hotels }: { title: string; items: ReservationDocument[]; hotels: Map<string, HotelPublicProfile> }) {
  return <View style={styles.group}><Text style={styles.groupTitle}>{title}</Text>{items.map((item) => <ReservationRow key={item.reservationId} reservation={item} hotel={hotels.get(item.hotelId)} />)}</View>;
}

function ReservationRow({ reservation, hotel }: { reservation: ReservationDocument; hotel: HotelPublicProfile | undefined }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const format = useBookingFormat();
  const room = useRoom(reservation.hotelId, reservation.roomId);
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/(tabs)/stay/booking/detail', params: { reservationId: reservation.reservationId } })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.copy}>
        <View style={styles.badges}><ReservationStatusBadge status={reservation.status} /><Text style={styles.code}>{reservation.confirmationCode}</Text></View>
        <Text style={styles.hotel}>{hotel ? l(hotel.name) : reservation.hotelId}</Text>
        {room.data ? <Text numberOfLines={1} style={styles.room}>{l(room.data.name)}</Text> : null}
        <Text style={styles.dates}>{`${format.date(reservation.checkIn)} → ${format.date(reservation.checkOut)}・${reservation.rooms > 1 ? `${format.rooms(reservation.rooms)}・` : ''}${format.guests(reservation)}`}</Text>
      </View>
      <Ionicons accessibilityLabel={t('common.viewDetails')} color={colors.textMuted} name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  description: { ...typography.body, color: colors.textMuted },
  empty: { gap: spacing.md },
  group: { gap: spacing.sm },
  groupTitle: { ...typography.label, color: colors.textMuted },
  row: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  pressed: { opacity: 0.72 },
  copy: { flex: 1, gap: 2 },
  badges: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  code: { ...typography.caption, color: colors.textMuted, letterSpacing: 1 },
  hotel: { ...typography.label, color: colors.text, marginTop: spacing.xxs },
  room: { ...typography.caption, color: colors.textMuted },
  dates: { ...typography.body, color: colors.brand },
});
