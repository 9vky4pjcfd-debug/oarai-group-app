import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { FormField } from '@/components/FormField';
import { PageHeader } from '@/components/PageHeader';
import { Badge, Button, Card, EmptyState, Screen, SectionHeader } from '@/components/design-system';
import { environmentConfig } from '@/config';
import { colors, spacing, typography } from '@/constants';
import { useHotel, useLocalized } from '@/features/content';
import { useAuthState } from '@/features/auth/AuthProvider';
import { EmailVerificationNotice } from '@/features/auth/EmailVerificationNotice';
import { SignInPrompt } from '@/features/auth/SignInPrompt';
import { useMemberIdentity, useMembership } from '@/features/member/membership';
import { calculateEarnedPoints } from '@/features/member/membership-rules';
import { contactErrors, type ContactField } from '@/services/booking/booking-rules';
import { bookingFailureReason } from '@/services/booking/ReservationServiceImpl';
import { services } from '@/services';
import { serverRefusalReason } from '@/services/errors/error-mapper';
import type { GuestContact, RoomOffer, StaySearch } from '@/types';
import { parseStayParams, toStayParams, useBookingFormat, useRoomOffers, type StayParams } from './booking';
import { CancellationPolicy } from './CancellationPolicy';
import { StaySummary } from './StaySummary';

/** Step 3: review price and rules, enter contact details, and book. */
export function BookingConfirmScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<StayParams>();
  const search = parseStayParams(params);
  const offers = useRoomOffers(search);
  const identity = useMemberIdentity();

  const header = <><PageHeader title={t('booking.title')} backLabel={t('common.back')} /><SectionHeader eyebrow={t('booking.stepConfirm')} title={t('booking.confirmTitle')} /></>;
  if (!search || !params.roomId) return <Screen>{header}<EmptyState title={t('state.empty')} /></Screen>;
  if (identity.status === 'signed-out') return <Screen>{header}<SignInPrompt title={t('booking.confirmTitle')} description={t('booking.signInRequired')} redirect={confirmUrl(search, params.roomId)} /></Screen>;

  return (
    <Screen keyboardShouldPersistTaps="handled">
      {header}
      <ContentGate state={offers} onRetry={offers.reload}>
        {(list) => {
          const offer = list.find((item) => item.roomId === params.roomId);
          if (!offer || offer.remaining < search.rooms) return <SoldOut search={search} />;
          return <ConfirmForm offer={offer} search={search} userId={identity.userId} onPriceChanged={offers.reload} />;
        }}
      </ContentGate>
    </Screen>
  );
}

/** This step's own URL, so signing in comes straight back to the same booking. */
function confirmUrl(search: StaySearch, roomId: string) {
  const query = Object.entries(toStayParams(search, roomId)).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `/(tabs)/stay/booking/confirm?${query}`;
}

function SoldOut({ search }: { search: StaySearch }) {
  const { t } = useTranslation();
  return (
    <Card style={styles.card}>
      <Text style={styles.body}>{t('booking.soldOutError')}</Text>
      <Button label={t('booking.backToRooms')} variant="secondary" onPress={() => router.replace({ pathname: '/(tabs)/stay/booking/rooms', params: toStayParams(search) })} />
    </Card>
  );
}

function ConfirmForm({ offer, search, userId, onPriceChanged }: { offer: RoomOffer; search: StaySearch; userId: string | null; onPriceChanged: () => void }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const format = useBookingFormat();
  const auth = useAuthState();
  const hotel = useHotel(search.hotelId);
  const membership = useMembership(userId);
  const policy = services.reservations.getPolicy();

  // The name starts as the member's own and becomes whatever the guest types.
  const [typedName, setTypedName] = useState<string | null>(null);
  const [details, setDetails] = useState<Omit<GuestContact, 'name'>>({ phone: '', email: auth.session?.user.email ?? '' });
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<'sold-out' | 'price-changed' | 'email-not-verified' | 'other' | null>(null);
  const user = auth.session?.user;
  const unverified = environmentConfig.backendMode === 'firebase' && user?.emailVerified === false;

  const contact: GuestContact = { ...details, name: typedName ?? membership.data?.profile.displayName ?? '' };

  const errors = contactErrors(contact);
  const showError = (field: ContactField) => touched && errors.includes(field);
  const points = membership.data ? calculateEarnedPoints(offer.totalAmount, membership.data.progress.current) : null;

  const submit = async () => {
    setTouched(true);
    if (errors.length > 0 || !userId || unverified) return;
    setSubmitting(true);
    setFailure(null);
    try {
      const reservation = await services.reservations.createReservation(userId, { ...search, roomId: offer.roomId, contact, notes, quotedTotal: offer.totalAmount });
      router.replace({ pathname: '/(tabs)/stay/booking/detail', params: { reservationId: reservation.reservationId, created: '1' } });
    } catch (error) {
      const reason = bookingFailureReason(error) ?? (serverRefusalReason(error) === 'email-not-verified' ? 'email-not-verified' : null);
      setFailure(reason ?? 'other');
      if (reason === 'price-changed') onPriceChanged();
    } finally {
      setSubmitting(false);
    }
  };

  if (failure === 'sold-out') return <SoldOut search={search} />;

  return (
    <>
      {environmentConfig.backendMode === 'mock' ? <Badge label={t('booking.demoNotice')} tone="warning" /> : null}
      <Card style={styles.card}>
        <Row label={t('booking.stay')}><StaySummary search={search} hotelName={hotel.data ? l(hotel.data.name) : undefined} /></Row>
        <Row label={t('booking.room')}><Text style={styles.value}>{search.rooms > 1 ? `${l(offer.room.name)} × ${format.rooms(search.rooms)}` : l(offer.room.name)}</Text></Row>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.label}>{t('booking.price')}</Text>
        {offer.nightly.map((night) => (
          <View key={night.date} style={styles.line}><Text style={styles.body}>{t('booking.night', { date: format.date(night.date) })}</Text><Text style={styles.body}>{format.yen(night.amount)}</Text></View>
        ))}
        <View style={[styles.line, styles.totalLine]}><Text style={styles.label}>{t('booking.total')}</Text><Text style={styles.total}>{format.yen(offer.totalAmount)}</Text></View>
        {points && membership.data ? <Text style={styles.caption}>{`${t('booking.expectedPoints')}: ${t('booking.expectedPointsValue', { points: points.total.toLocaleString(), tier: l(membership.data.progress.current.name) })}`}</Text> : null}
      </Card>
      <Card style={styles.card}>
        <Row label={t('booking.payment')}><Text style={styles.body}>{t('booking.payAtHotel')}</Text></Row>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.label}>{t('booking.cancellation')}</Text>
        <CancellationPolicy checkIn={search.checkIn} totalAmount={offer.totalAmount} policy={policy} />
      </Card>
      <Card style={styles.card}>
        <Text style={styles.label}>{t('booking.contact')}</Text>
        <FormField label={t('booking.name')} error={showError('name') ? t('booking.nameError') : undefined} value={contact.name} onChangeText={setTypedName} autoComplete="name" textContentType="name" />
        <FormField label={t('booking.phone')} error={showError('phone') ? t('booking.phoneError') : undefined} value={contact.phone} onChangeText={(phone) => setDetails({ ...details, phone })} autoComplete="tel" keyboardType="phone-pad" textContentType="telephoneNumber" />
        <FormField label={t('booking.email')} error={showError('email') ? t('booking.emailError') : undefined} value={contact.email} onChangeText={(email) => setDetails({ ...details, email })} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
        <FormField label={t('booking.notes')} value={notes} onChangeText={setNotes} placeholder={t('booking.notesPlaceholder')} multiline maxLength={500} />
      </Card>
      {unverified || failure === 'email-not-verified' ? <EmailVerificationNotice email={user?.email ?? null} message={t('auth.verify.bookingMessage')} /> : null}
      {failure && failure !== 'email-not-verified' ? <Text accessibilityLiveRegion="assertive" style={styles.error}>{failure === 'price-changed' ? t('booking.priceChangedError') : t('booking.submitError')}</Text> : null}
      <Button label={t('booking.submit')} loading={submitting} disabled={unverified} onPress={submit} />
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><View style={styles.rowValue}>{children}</View></View>;
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowLabel: { ...typography.caption, color: colors.textMuted, width: 72, paddingTop: 2 },
  rowValue: { flex: 1 },
  label: { ...typography.label, color: colors.text },
  value: { ...typography.label, color: colors.text },
  body: { ...typography.body, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLine: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, paddingTop: spacing.sm },
  total: { ...typography.heading, color: colors.brand },
  error: { ...typography.caption, color: colors.error },
});
