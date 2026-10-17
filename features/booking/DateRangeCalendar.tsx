import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radii, spacing, typography } from '@/constants';
import { addDays, parseDateOnly, toDateOnly } from '@/services/booking/booking-rules';
import type { DateOnly } from '@/types';
import { nextRange, type DateRange } from './date-range';

export type { DateRange } from './date-range';

const monthStart = (value: DateOnly) => `${value.slice(0, 7)}-01`;
function addMonths(value: DateOnly, months: number): DateOnly {
  const date = parseDateOnly(monthStart(value));
  date.setUTCMonth(date.getUTCMonth() + months);
  return toDateOnly(date);
}

/** Month grid (Sunday first, as on Japanese calendars) for picking a stay. */
export function DateRangeCalendar({ range, onChange, minDate, maxDate, maxNights }: { range: DateRange; onChange: (range: DateRange) => void; minDate: DateOnly; maxDate: DateOnly; maxNights: number }) {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const [month, setMonth] = useState(() => monthStart(range.checkIn ?? minDate));

  const weeks = useMemo(() => {
    const first = parseDateOnly(month);
    const start = addDays(month, -first.getUTCDay());
    const days = addMonths(month, 1);
    const cells: DateOnly[] = [];
    for (let day = start; day < days || cells.length % 7 !== 0; day = addDays(day, 1)) cells.push(day);
    return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  }, [month]);

  const weekdayLabels = useMemo(() => Array.from({ length: 7 }, (_, index) => new Date(Date.UTC(2026, 1, 1 + index)).toLocaleDateString(locale, { weekday: 'narrow', timeZone: 'UTC' })), [locale]);
  const title = parseDateOnly(month).toLocaleDateString(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' });
  const canGoBack = month > monthStart(minDate);
  const canGoForward = addMonths(month, 1) <= maxDate;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <NavButton disabled={!canGoBack} icon="chevron-back" label={t('booking.previousMonth')} onPress={() => setMonth(addMonths(month, -1))} />
        <Text style={styles.title}>{title}</Text>
        <NavButton disabled={!canGoForward} icon="chevron-forward" label={t('booking.nextMonth')} onPress={() => setMonth(addMonths(month, 1))} />
      </View>
      <View style={styles.row}>{weekdayLabels.map((label, index) => <Text key={index} style={[styles.weekday, index === 0 && styles.sunday, index === 6 && styles.saturday]}>{label}</Text>)}</View>
      {weeks.map((week) => (
        <View key={week[0]} style={styles.row}>
          {week.map((day, index) => {
            const inMonth = day.slice(0, 7) === month.slice(0, 7);
            const disabled = day < minDate || day > maxDate;
            const isStart = day === range.checkIn;
            const isEnd = day === range.checkOut;
            const between = Boolean(range.checkIn && range.checkOut && day > range.checkIn && day < range.checkOut);
            const label = parseDateOnly(day).toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC' });
            if (!inMonth) return <View key={day} style={styles.cell} />;
            return (
              <Pressable
                key={day}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ disabled, selected: isStart || isEnd }}
                disabled={disabled}
                onPress={() => onChange(nextRange(range, day, maxNights))}
                style={[styles.cell, between && styles.between, (isStart || isEnd) && styles.selected]}>
                <Text style={[styles.day, index === 0 && styles.sunday, index === 6 && styles.saturday, disabled && styles.disabled, (isStart || isEnd) && styles.selectedText]}>{Number(day.slice(8))}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function NavButton({ icon, label, disabled, onPress }: { icon: 'chevron-back' | 'chevron-forward'; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" disabled={disabled} hitSlop={8} onPress={onPress} style={[styles.nav, disabled && styles.navDisabled]}>
      <Ionicons color={colors.brand} name={icon} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...typography.label, color: colors.text },
  nav: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radii.pill, height: 36, justifyContent: 'center', width: 36 },
  navDisabled: { opacity: 0.3 },
  row: { flexDirection: 'row' },
  weekday: { ...typography.caption, color: colors.textMuted, flex: 1, textAlign: 'center' },
  cell: { alignItems: 'center', aspectRatio: 1, flex: 1, justifyContent: 'center', maxHeight: 48 },
  between: { backgroundColor: colors.accentSoft },
  selected: { backgroundColor: colors.brand, borderRadius: radii.md },
  day: { ...typography.body, color: colors.text },
  sunday: { color: colors.error },
  saturday: { color: colors.brand },
  disabled: { color: colors.border },
  selectedText: { color: colors.white, fontWeight: '700' },
});
