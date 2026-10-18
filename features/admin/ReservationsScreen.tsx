import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { FormField } from '@/components/FormField';
import { Button, Card, EmptyState } from '@/components/design-system';
import { colors, spacing } from '@/constants';
import { useContent, useLocalized, useRooms } from '@/features/content';
import { useBookingFormat } from '@/features/booking/booking';
import { ReservationStatusBadge } from '@/features/booking/ReservationStatusBadge';
import { HotelPicker } from '@/features/hotels/HotelPicker';
import { addDays, daysBetween } from '@/services/booking/booking-rules';
import { services } from '@/services';
import type { HotelPublicProfile, ReservationDocument, ReservationQuery, Room } from '@/types';
import { rangeError } from './admin-rules';
import { AdminGate, AdminScreen, HotelScope, InfoRow, Message, adminStyles } from './AdminUI';

export function ReservationsScreen() {
  const { t } = useTranslation();
  return (
    <AdminScreen title={t('admin.reservations.title')} description={t('admin.reservations.description')}>
      <AdminGate minimum="staff">{(user) => <HotelScope user={user}>{(hotels) => <Reservations hotels={hotels} />}</HotelScope>}</AdminGate>
    </AdminScreen>
  );
}

function Reservations({ hotels }: { hotels: HotelPublicProfile[] }) {
  const { t } = useTranslation();
  const today = services.reservations.today();
  const [hotelId, setHotelId] = useState(hotels[0]!.hotelId);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(addDays(today, 30));
  const [query, setQuery] = useState<Omit<ReservationQuery, 'hotelId'>>({ from: today, to: addDays(today, 30) });
  const [invalid, setInvalid] = useState<string | null>(null);
  const rooms = useRooms(hotelId);
  const reservations = useContent(`admin-reservations:${hotelId}:${query.from}:${query.to}`, async () =>
    [...await services.admin.listReservations({ hotelId, ...query })].sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.createdAt.localeCompare(b.createdAt)));
  const roomMap = useMemo(() => new Map((rooms.data ?? []).map((room) => [room.roomId, room])), [rooms.data]);

  const search = () => {
    const error = rangeError(from, to);
    setInvalid(error ? t(`admin.validation.range.${error}`) : null);
    if (error) return;
    if (from === query.from && to === query.to) reservations.reload();
    else setQuery({ from, to });
  };

  return (
    <>
      {hotels.length > 1 ? <HotelPicker hotels={hotels} selected={hotelId} onSelect={setHotelId} /> : null}
      <Card style={adminStyles.card}>
        <Text style={adminStyles.label}>{t('admin.reservations.checkInRange')}</Text>
        <View style={adminStyles.fields}>
          <View style={adminStyles.fieldItem}><FormField label={t('admin.from')} value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" autoCapitalize="none" /></View>
          <View style={adminStyles.fieldItem}><FormField label={t('admin.to')} value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" autoCapitalize="none" /></View>
        </View>
        <Message text={invalid} tone="error" />
        <Button label={t('admin.reservations.search')} onPress={search} />
      </Card>
      <ContentGate state={reservations} onRetry={reservations.reload}>
        {(list) => list.length === 0
          ? <EmptyState title={t('admin.reservations.empty')} />
          : (
            <View style={styles.list}>
              <Text style={adminStyles.muted}>{t('admin.reservations.count', { count: list.length, rooms: list.filter((item) => item.status !== 'cancelled').reduce((sum, item) => sum + item.rooms, 0) })}</Text>
              {list.map((reservation) => <ReservationCard key={reservation.reservationId} reservation={reservation} room={roomMap.get(reservation.roomId)} />)}
            </View>
          )}
      </ContentGate>
    </>
  );
}

function ReservationCard({ reservation, room }: { reservation: ReservationDocument; room: Room | undefined }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const format = useBookingFormat();
  const nights = daysBetween(reservation.checkIn, reservation.checkOut);
  return (
    <Card style={[adminStyles.card, reservation.status === 'cancelled' && styles.cancelled]}>
      <View style={adminStyles.rowWrap}>
        <Text selectable style={styles.code}>{reservation.confirmationCode}</Text>
        <ReservationStatusBadge status={reservation.status} />
      </View>
      <InfoRow label={t('admin.reservations.stay')} value={`${format.date(reservation.checkIn)} → ${format.date(reservation.checkOut)}（${t('booking.nights', { count: nights })}）`} />
      <InfoRow label={t('admin.reservations.guest')} value={reservation.contact.name} />
      <InfoRow label={t('admin.reservations.phone')} value={reservation.contact.phone} />
      <InfoRow label={t('admin.reservations.email')} value={reservation.contact.email} />
      <InfoRow label={t('admin.reservations.room')} value={`${room ? l(room.name) : reservation.roomId} × ${format.rooms(reservation.rooms)}`} />
      <InfoRow label={t('admin.reservations.guests')} value={format.guests(reservation)} />
      <InfoRow label={t('admin.reservations.total')} value={format.yen(reservation.totalAmount)} />
      {reservation.notes ? <InfoRow label={t('admin.reservations.notes')} value={reservation.notes} /> : null}
      <Text style={adminStyles.muted}>{t('admin.reservations.bookedAt', { date: format.longDate(reservation.createdAt.slice(0, 10)) })}{reservation.cancelledAt ? ` · ${t('admin.reservations.cancelledAt', { date: format.longDate(reservation.cancelledAt.slice(0, 10)) })}` : ''}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  cancelled: { opacity: 0.7 },
  code: { color: colors.brand, fontSize: 20, fontWeight: '700', letterSpacing: 2 },
});
