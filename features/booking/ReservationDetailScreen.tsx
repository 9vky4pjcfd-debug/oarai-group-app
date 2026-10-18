import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Screen } from '@/components/design-system';
import { colors, radii, spacing, typography } from '@/constants';
import { useHotel, useLocalized, useRoom } from '@/features/content';
import { SignInPrompt } from '@/features/auth/SignInPrompt';
import { useMemberIdentity } from '@/features/member/membership';
import { environmentConfig } from '@/config';
import { cancellationFee, cancellationFeeRate, canCancelInApp, daysBetween } from '@/services/booking/booking-rules';
import { services } from '@/services';
import type { ReservationDocument } from '@/types';
import { useBookingFormat, useOwnReservation } from './booking';
import { CancellationPolicy } from './CancellationPolicy';
import { ReservationStatusBadge } from './ReservationStatusBadge';

export function ReservationDetailScreen() {
  const { t } = useTranslation();
  const { reservationId = '', created } = useLocalSearchParams<{ reservationId: string; created?: string }>();
  const identity = useMemberIdentity();
  const reservation = useOwnReservation(identity.userId, reservationId);

  return (
    <Screen>
      <PageHeader title={t('booking.detailTitle')} backLabel={t('common.back')} />
      {identity.status === 'signed-out'
        ? <SignInPrompt title={t('booking.detailTitle')} description={t('booking.signInRequired')} redirect={`/(tabs)/stay/booking/detail?reservationId=${encodeURIComponent(reservationId)}`} />
        : <ContentGate state={reservation} onRetry={reservation.reload}>{(data) => <Detail initial={data} userId={identity.userId!} justCreated={created === '1'} />}</ContentGate>}
    </Screen>
  );
}

function Detail({ initial, userId, justCreated }: { initial: ReservationDocument; userId: string; justCreated: boolean }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const format = useBookingFormat();
  const [reservation, setReservation] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelFailed, setCancelFailed] = useState(false);
  const hotel = useHotel(reservation.hotelId);
  const room = useRoom(reservation.hotelId, reservation.roomId);
  const policy = services.reservations.getPolicy();
  const today = services.reservations.today();
  const cancellable = canCancelInApp(reservation, policy, today);
  const feeRate = cancellationFeeRate(reservation.checkIn, today, policy);
  const active = reservation.status === 'confirmed' || reservation.status === 'pending';
  const phone = hotel.data?.phone;

  const cancel = async () => {
    setCancelling(true);
    setCancelFailed(false);
    try {
      setReservation(await services.reservations.cancelReservation(userId, reservation.reservationId));
      setConfirming(false);
    } catch {
      setCancelFailed(true);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      {justCreated && reservation.status !== 'cancelled' ? (
        <Card style={[styles.card, styles.success]}>
          <Ionicons color={colors.success} name="checkmark-circle" size={36} />
          <Text style={styles.successTitle}>{t('booking.createdTitle')}</Text>
          <Text style={styles.muted}>{t('booking.createdMessage')}</Text>
          <Text style={styles.muted}>{environmentConfig.backendMode === 'mock' ? t('booking.createdEmailDemo') : t('booking.createdEmail', { email: reservation.contact.email })}</Text>
        </Card>
      ) : null}
      <Card style={[styles.card, styles.codeCard]}>
        <View style={styles.headerRow}><ReservationStatusBadge status={reservation.status} /></View>
        <Text style={styles.muted}>{t('booking.confirmationCode')}</Text>
        <Text selectable style={styles.code}>{reservation.confirmationCode}</Text>
        {reservation.cancelledAt ? <Text style={styles.muted}>{t('booking.cancelledAt', { date: format.longDate(reservation.cancelledAt.slice(0, 10)) })}</Text> : null}
      </Card>
      <Card style={styles.card}>
        <Row label={t('booking.hotel')} value={hotel.data ? l(hotel.data.name) : reservation.hotelId} />
        <Row label={t('booking.room')} value={`${room.data ? l(room.data.name) : reservation.roomId}${reservation.rooms > 1 ? ` × ${format.rooms(reservation.rooms)}` : ''}`} />
        <Row label={t('booking.dates')} value={`${format.longDate(reservation.checkIn)} → ${format.longDate(reservation.checkOut)} · ${t('booking.nights', { count: daysBetween(reservation.checkIn, reservation.checkOut) })}`} />
        <Row label={t('booking.guests')} value={format.guests(reservation)} />
        <Row label={t('booking.total')} value={format.yen(reservation.totalAmount)} />
        <Row label={t('booking.payment')} value={t('booking.payAtHotel')} />
        <Row label={t('booking.name')} value={reservation.contact.name} />
        {reservation.notes ? <Row label={t('booking.notes')} value={reservation.notes} /> : null}
        <Row label={t('booking.bookedAt')} value={format.longDate(reservation.createdAt.slice(0, 10))} />
      </Card>
      {active ? (
        <Card style={styles.card}>
          <Text style={styles.label}>{t('booking.cancellation')}</Text>
          <CancellationPolicy checkIn={reservation.checkIn} totalAmount={reservation.totalAmount} policy={policy} />
        </Card>
      ) : null}
      {active && cancellable && !confirming ? <Button label={t('booking.cancel')} variant="secondary" onPress={() => setConfirming(true)} /> : null}
      {active && cancellable && confirming ? (
        <Card style={styles.card}>
          <Text style={styles.body}>{t('booking.cancelConfirm')}</Text>
          {cancelFailed ? <Text style={styles.error}>{t('booking.cancelError')}</Text> : null}
          <Button label={t('booking.cancelYes')} loading={cancelling} onPress={cancel} style={styles.danger} />
          <Button label={t('booking.cancelNo')} variant="ghost" onPress={() => setConfirming(false)} />
        </Card>
      ) : null}
      {active && !cancellable ? (
        <Card style={styles.card}>
          <Text style={styles.body}>{t('booking.cancelByPhone', { rate: format.percent(feeRate), amount: format.yen(cancellationFee(reservation.totalAmount, feeRate)) })}</Text>
          {phone ? <Button label={`${t('booking.callHotel')}（${phone}）`} variant="secondary" onPress={() => Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`)} /> : null}
        </Card>
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  success: { alignItems: 'center', borderColor: colors.success },
  codeCard: { alignItems: 'center' },
  successTitle: { ...typography.heading, color: colors.text },
  headerRow: { alignSelf: 'stretch', flexDirection: 'row' },
  code: { fontSize: 30, fontWeight: '700', letterSpacing: 3, color: colors.brand, textAlign: 'center' },
  muted: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  body: { ...typography.body, color: colors.text },
  label: { ...typography.label, color: colors.text },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowLabel: { ...typography.caption, color: colors.textMuted, paddingTop: 3, width: 80 },
  rowValue: { ...typography.body, color: colors.text, flex: 1 },
  error: { ...typography.caption, color: colors.error },
  danger: { backgroundColor: colors.error, borderRadius: radii.pill },
});
