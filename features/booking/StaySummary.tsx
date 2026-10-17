import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '@/constants';
import { daysBetween } from '@/services/booking/booking-rules';
import type { StaySearch } from '@/types';
import { useBookingFormat } from './booking';

/** "Oct 20 (Tue) → Oct 22 (Thu) · 2 nights · 2 adults" */
export function StaySummary({ search, hotelName }: { search: StaySearch; hotelName?: string | undefined }) {
  const { t } = useTranslation();
  const format = useBookingFormat();
  return (
    <View style={styles.container}>
      {hotelName ? <Text style={styles.hotel}>{hotelName}</Text> : null}
      <Text style={styles.dates}>{`${format.date(search.checkIn)} → ${format.date(search.checkOut)}`}</Text>
      <Text style={styles.meta}>{[t('booking.nights', { count: daysBetween(search.checkIn, search.checkOut) }), format.rooms(search.rooms), format.guests(search)].join('・')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 2 },
  hotel: { ...typography.caption, color: colors.accent, letterSpacing: 1 },
  dates: { ...typography.label, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted },
});
