import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { environmentConfig } from '@/config';
import { ContentGate } from '@/components/ContentGate';
import { MenuRow } from '@/components/MenuRow';
import { PageHeader } from '@/components/PageHeader';
import { Badge, Button, Card, Screen, SectionHeader } from '@/components/design-system';
import { colors, DEFAULT_HOTEL_ID, spacing, typography } from '@/constants';
import { useHotels } from '@/features/content';
import { HotelPicker } from '@/features/hotels/HotelPicker';
import { addDays, daysBetween } from '@/services/booking/booking-rules';
import { services } from '@/services';
import { parseStayParams, toStayParams, useBookingFormat, type StayParams } from './booking';
import { DateRangeCalendar, type DateRange } from './DateRangeCalendar';
import { Stepper } from './Stepper';

/** Party limits per room, so the steppers stay reasonable for multi-room bookings. */
const MAX_ADULTS_PER_ROOM = 6;
const MAX_CHILDREN_PER_ROOM = 4;

/** Step 1: hotel, dates and party size. Opened from the stay tab, a hotel page or a room page (which preselects the room). */
export function BookingSearchScreen() {
  const { t } = useTranslation();
  const format = useBookingFormat();
  const params = useLocalSearchParams<StayParams>();
  const previous = parseStayParams(params);
  const policy = services.reservations.getPolicy();
  const today = services.reservations.today();
  const hotels = useHotels();

  const [selectedHotel, setSelectedHotel] = useState<string | undefined>(params.hotelId);
  const [range, setRange] = useState<DateRange>({ checkIn: previous?.checkIn ?? null, checkOut: previous?.checkOut ?? null });
  const [adults, setAdults] = useState(previous?.adults ?? 2);
  const [children, setChildren] = useState(previous?.children ?? 0);
  const [infants, setInfants] = useState(previous?.infants ?? 0);
  const [rooms, setRooms] = useState(previous?.rooms ?? 1);
  const hotelId = selectedHotel ?? hotels.data?.[0]?.hotelId ?? DEFAULT_HOTEL_ID;
  // A room picked on the room page only applies to that room's hotel.
  const roomId = hotelId === params.hotelId ? params.roomId : undefined;
  const phone = hotels.data?.find((hotel) => hotel.hotelId === hotelId)?.phone;

  // Every room needs an adult, and every infant shares a bed with one.
  const changeRooms = (value: number) => { setRooms(value); if (adults < value) setAdults(value); };
  const changeAdults = (value: number) => { setAdults(value); if (infants > value) setInfants(value); };

  const search = () => {
    if (!range.checkIn || !range.checkOut) return;
    router.push({ pathname: '/(tabs)/stay/booking/rooms', params: toStayParams({ hotelId, checkIn: range.checkIn, checkOut: range.checkOut, adults, children, infants, rooms }, roomId) });
  };

  const rangeLabel = !range.checkIn
    ? t('booking.pickCheckIn')
    : !range.checkOut
      ? `${format.date(range.checkIn)} → ${t('booking.pickCheckOut')}`
      : `${format.date(range.checkIn)} → ${format.date(range.checkOut)}・${t('booking.nights', { count: daysBetween(range.checkIn, range.checkOut) })}`;

  return (
    <Screen>
      <PageHeader title={t('booking.title')} backLabel={t('common.back')} />
      <SectionHeader eyebrow={t('booking.stepSearch')} title={t('booking.searchTitle')} description={t('booking.searchDescription')} />
      {environmentConfig.backendMode === 'mock' ? <Badge label={t('booking.demoNotice')} tone="warning" /> : null}
      <View style={styles.group}>
        <Text style={styles.label}>{t('booking.hotel')}</Text>
        <ContentGate state={hotels} onRetry={hotels.reload}>{(list) => <HotelPicker hotels={list} selected={hotelId} onSelect={setSelectedHotel} />}</ContentGate>
      </View>
      <Card style={styles.card}>
        <Text style={styles.label}>{t('booking.dates')}</Text>
        <Text accessibilityLiveRegion="polite" style={styles.range}>{rangeLabel}</Text>
        <DateRangeCalendar range={range} onChange={setRange} minDate={today} maxDate={addDays(today, policy.bookingWindowDays)} maxNights={policy.maxNights} />
        <Text style={styles.note}>{t('booking.maxNights', { count: policy.maxNights })}</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.label}>{t('booking.guests')}</Text>
        <Stepper label={t('booking.roomsLabel')} note={t('booking.roomsAdultsNote')} value={rooms} min={1} max={policy.maxRoomsOnline} onChange={changeRooms} />
        <Stepper label={t('booking.adults')} value={adults} min={rooms} max={MAX_ADULTS_PER_ROOM * rooms} onChange={changeAdults} />
        <Stepper label={t('booking.children')} note={t('booking.childrenNote')} value={children} min={0} max={MAX_CHILDREN_PER_ROOM * rooms} onChange={setChildren} />
        <Stepper label={t('booking.infants')} note={t('booking.infantsNote')} value={infants} min={0} max={adults} onChange={setInfants} />
        <Text style={styles.note}>{`${t('booking.roomsNote', { count: policy.maxRoomsOnline })}${phone ? ` ${t('booking.roomsPhone', { phone })}` : ''}`}</Text>
      </Card>
      <Button disabled={!range.checkIn || !range.checkOut} label={t('booking.search')} onPress={search} />
      <MenuRow icon="receipt-outline" title={t('booking.myReservations')} description={t('booking.myReservationsDescription')} href="/(tabs)/stay/booking/reservations" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  card: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
  range: { ...typography.heading, color: colors.brand },
  note: { ...typography.caption, color: colors.textMuted },
});
