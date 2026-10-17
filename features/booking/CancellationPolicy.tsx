import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@/constants';
import { cancellationFee, freeCancellationUntil, sortedFeeTiers } from '@/services/booking/booking-rules';
import type { BookingPolicy, DateOnly } from '@/types';
import { services } from '@/services';
import { useBookingFormat } from './booking';

/** The free-cancellation date and each fee tier with its yen amount for this stay. */
export function CancellationPolicy({ checkIn, totalAmount, policy }: { checkIn: DateOnly; totalAmount: number; policy: BookingPolicy }) {
  const { t } = useTranslation();
  const format = useBookingFormat();
  const tiers = sortedFeeTiers(policy);
  const freeUntil = freeCancellationUntil(checkIn, policy);
  const dayLabel = (from: number, to: number) => {
    if (from === to) return from === 0 ? t('booking.feeSameDay') : from === 1 ? t('booking.feeDayBefore') : t('booking.feeDay', { days: from });
    return from - to === 1 ? t('booking.feeDays', { from, to }) : `${t('booking.feeDay', { days: from })} – ${t('booking.feeDay', { days: to })}`;
  };
  const rows = [
    ...tiers.map((tier, index) => ({ label: dayLabel(tier.daysBefore, (tiers[index + 1]?.daysBefore ?? -1) + 1), rate: tier.rate })),
    { label: t('booking.feeNoShow'), rate: policy.noShowRate },
  ];

  return (
    <View style={styles.container}>
      {freeUntil >= services.reservations.today() ? <Text style={styles.body}>{t('booking.freeCancellation', { date: format.longDate(freeUntil) })}</Text> : null}
      <Text style={styles.caption}>{t('booking.feeTitle')}</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.line}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{`${format.percent(row.rate)}（${format.yen(cancellationFee(totalAmount, row.rate))}）`}</Text>
        </View>
      ))}
      <Text style={styles.caption}>{t('booking.feeByPhone')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxs },
  body: { ...typography.body, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  label: { ...typography.body, color: colors.text, flexShrink: 1 },
  value: { ...typography.body, color: colors.text },
});
