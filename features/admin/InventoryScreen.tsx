import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { FormField } from '@/components/FormField';
import { Badge, Button, Card } from '@/components/design-system';
import { colors, radii, spacing, typography } from '@/constants';
import { useContent, useLocalized, useRooms } from '@/features/content';
import { useBookingFormat } from '@/features/booking/booking';
import { HotelPicker } from '@/features/hotels/HotelPicker';
import { services } from '@/services';
import type { DateOnly, HotelPublicProfile, InventoryRow, InventoryUpdate, Room } from '@/types';
import { datesBetween, monthEnd, monthStart, parseCount, rangeError, shiftMonth } from './admin-rules';
import { AdminGate, AdminScreen, Chip, ChipRow, HotelScope, Message, adminStyles, useAdminError } from './AdminUI';

const weekdays = [0, 1, 2, 3, 4, 5, 6];
/** 2026-01-04 is a Sunday; used to print localized weekday names. */
const weekdayName = (day: number, locale: string) => new Date(Date.UTC(2026, 0, 4 + day)).toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' });

export function InventoryScreen() {
  const { t } = useTranslation();
  return (
    <AdminScreen title={t('admin.inventory.title')} description={t('admin.inventory.description')}>
      <AdminGate minimum="staff">{(user) => <HotelScope user={user}>{(hotels) => <Inventory hotels={hotels} />}</HotelScope>}</AdminGate>
    </AdminScreen>
  );
}

function Inventory({ hotels }: { hotels: HotelPublicProfile[] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const [hotelId, setHotelId] = useState(hotels[0]!.hotelId);
  const [month, setMonth] = useState(() => monthStart(services.reservations.today()));
  const rooms = useRooms(hotelId);
  const inventory = useContent(`admin-inventory:${hotelId}:${month}`, () => services.admin.getInventory({ hotelId, from: month, to: monthEnd(month) }));
  const monthLabel = new Date(`${month}T00:00:00Z`).toLocaleDateString(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' });

  return (
    <>
      {hotels.length > 1 ? <HotelPicker hotels={hotels} selected={hotelId} onSelect={setHotelId} /> : null}
      <View style={styles.monthBar}>
        <Pressable accessibilityLabel={t('admin.inventory.prevMonth')} accessibilityRole="button" hitSlop={8} onPress={() => setMonth(shiftMonth(month, -1))} style={styles.monthButton}><Ionicons color={colors.brand} name="chevron-back" size={22} /></Pressable>
        <Text style={adminStyles.heading}>{monthLabel}</Text>
        <Pressable accessibilityLabel={t('admin.inventory.nextMonth')} accessibilityRole="button" hitSlop={8} onPress={() => setMonth(shiftMonth(month, 1))} style={styles.monthButton}><Ionicons color={colors.brand} name="chevron-forward" size={22} /></Pressable>
      </View>
      <ContentGate state={rooms} onRetry={rooms.reload}>
        {(roomList) => (
          <>
            <BulkEditForm key={`${hotelId}:${month}`} hotelId={hotelId} rooms={roomList} month={month} onSaved={inventory.reload} />
            <Text style={adminStyles.muted}>{t('admin.inventory.legend')}</Text>
            <ContentGate state={inventory} onRetry={inventory.reload}>
              {(rows) => <>{roomList.map((room) => <RoomMonth key={room.roomId} room={room} month={month} rows={rows} />)}</>}
            </ContentGate>
          </>
        )}
      </ContentGate>
    </>
  );
}

function RoomMonth({ room, month, rows }: { room: Room; month: DateOnly; rows: InventoryRow[] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const l = useLocalized();
  const format = useBookingFormat();
  const byDate = useMemo(() => new Map(rows.filter((row) => row.roomId === room.roomId).map((row) => [row.date, row])), [rows, room.roomId]);
  return (
    <Card style={adminStyles.card}>
      <Text style={adminStyles.label}>{l(room.name)}</Text>
      <View style={styles.grid}>
        {datesBetween(month, monthEnd(month)).map((date) => {
          const row = byDate.get(date);
          const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
          const remaining = row ? Math.max(0, row.allotment - row.booked) : 0;
          return (
            <View key={date} style={[styles.cell, row?.closed && styles.cellClosed, row && !row.closed && remaining === 0 && styles.cellFull]}>
              <Text style={[styles.day, weekday === 0 && styles.sunday, weekday === 6 && styles.saturday]}>{new Date(`${date}T00:00:00Z`).toLocaleDateString(locale, { day: 'numeric', weekday: 'short', timeZone: 'UTC' })}</Text>
              {row ? (
                <>
                  <Text style={styles.remaining}>{t('admin.inventory.remainingShort', { count: remaining })}</Text>
                  <Text style={styles.small}>{t('admin.inventory.counts', { allotment: row.allotment, booked: row.booked })}</Text>
                  <Text style={styles.small}>{row.adultRate > 0 ? format.yen(row.adultRate) : t('admin.inventory.noRate')}</Text>
                  {row.closed ? <Badge label={t('admin.inventory.closed')} tone="warning" /> : null}
                </>
              ) : <Text style={styles.small}>{t('admin.inventory.notSet')}</Text>}
            </View>
          );
        })}
      </View>
    </Card>
  );
}

type ClosedChoice = 'keep' | 'close' | 'open';

function BulkEditForm({ hotelId, rooms, month, onSaved }: { hotelId: string; rooms: Room[]; month: DateOnly; onSaved: () => void }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const l = useLocalized();
  const errorText = useAdminError();
  const today = services.reservations.today();
  const [roomIds, setRoomIds] = useState(() => rooms.map((room) => room.roomId));
  const [from, setFrom] = useState(month < today && monthEnd(month) >= today ? today : month);
  const [to, setTo] = useState(monthEnd(month));
  const [days, setDays] = useState(weekdays);
  const [allotment, setAllotment] = useState('');
  const [adultRate, setAdultRate] = useState('');
  const [closed, setClosed] = useState<ClosedChoice>('keep');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const range = rangeError(from, to);
  const allotmentValue = parseCount(allotment);
  const rateValue = parseCount(adultRate);
  const nothing = allotmentValue === null && rateValue === null && closed === 'keep';
  const fieldErrors = {
    rooms: roomIds.length === 0 ? t('admin.validation.noRooms') : undefined,
    range: range ? t(`admin.validation.range.${range}`) : undefined,
    days: days.length === 0 ? t('admin.validation.noWeekdays') : undefined,
    allotment: Number.isNaN(allotmentValue) ? t('admin.validation.count') : undefined,
    rate: Number.isNaN(rateValue) ? t('admin.validation.count') : undefined,
    nothing: nothing ? t('admin.validation.nothingToSave') : undefined,
  };
  const valid = Object.values(fieldErrors).every((value) => value === undefined);
  const show = (message: string | undefined) => (submitted ? message : undefined);
  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const save = async () => {
    setSubmitted(true);
    setSaved(null);
    setError(null);
    if (!valid) return;
    const update: InventoryUpdate = {
      hotelId, roomIds, from, to,
      ...(days.length < 7 ? { weekdays: [...days].sort((a, b) => a - b) } : {}),
      ...(allotmentValue !== null ? { allotment: allotmentValue } : {}),
      ...(rateValue !== null ? { adultRate: rateValue } : {}),
      ...(closed !== 'keep' ? { closed: closed === 'close' } : {}),
    };
    setSaving(true);
    try {
      const result = await services.admin.updateInventory(update);
      setSaved(t('admin.inventory.saved', { count: result.updated }));
      setSubmitted(false);
      onSaved();
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={adminStyles.card}>
      <Text style={adminStyles.label}>{t('admin.inventory.bulkTitle')}</Text>
      <Text style={adminStyles.muted}>{t('admin.inventory.bulkDescription')}</Text>
      <ChipRow label={t('admin.inventory.rooms')}>
        <Chip label={t('admin.inventory.allRooms')} selected={roomIds.length === rooms.length} onPress={() => setRoomIds(roomIds.length === rooms.length ? [] : rooms.map((room) => room.roomId))} />
        {rooms.map((room) => <Chip key={room.roomId} label={l(room.name)} selected={roomIds.includes(room.roomId)} onPress={() => setRoomIds(toggle(roomIds, room.roomId))} />)}
      </ChipRow>
      <Message text={show(fieldErrors.rooms) ?? null} tone="error" />
      <View style={adminStyles.fields}>
        <View style={adminStyles.fieldItem}><FormField label={t('admin.from')} value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" autoCapitalize="none" /></View>
        <View style={adminStyles.fieldItem}><FormField label={t('admin.to')} value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" autoCapitalize="none" /></View>
      </View>
      <Message text={show(fieldErrors.range) ?? null} tone="error" />
      <ChipRow label={t('admin.inventory.weekdays')}>
        {weekdays.map((day) => <Chip key={day} label={weekdayName(day, locale)} selected={days.includes(day)} onPress={() => setDays(toggle(days, day))} />)}
      </ChipRow>
      <Message text={show(fieldErrors.days) ?? null} tone="error" />
      <View style={adminStyles.fields}>
        <View style={adminStyles.fieldItem}><FormField label={t('admin.inventory.allotment')} value={allotment} onChangeText={setAllotment} placeholder={t('admin.inventory.unchanged')} keyboardType="number-pad" error={show(fieldErrors.allotment)} /></View>
        <View style={adminStyles.fieldItem}><FormField label={t('admin.inventory.adultRate')} value={adultRate} onChangeText={setAdultRate} placeholder={t('admin.inventory.unchanged')} keyboardType="number-pad" error={show(fieldErrors.rate)} /></View>
      </View>
      <ChipRow label={t('admin.inventory.sales')}>
        {(['keep', 'open', 'close'] as const).map((choice) => <Chip key={choice} label={t(`admin.inventory.closedChoice.${choice}`)} selected={closed === choice} onPress={() => setClosed(choice)} />)}
      </ChipRow>
      <Message text={show(fieldErrors.nothing) ?? null} tone="error" />
      <Message text={error} tone="error" />
      <Message text={saved} tone="success" />
      <Button label={t('admin.inventory.apply')} loading={saving} onPress={save} />
    </Card>
  );
}

const styles = StyleSheet.create({
  monthBar: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  monthButton: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.pill, height: 44, justifyContent: 'center', width: 44 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  cell: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, gap: 2, minHeight: 92, padding: spacing.xs, width: 104 },
  cellClosed: { backgroundColor: '#FFF0E2', borderColor: colors.warning },
  cellFull: { borderColor: colors.error },
  day: { ...typography.caption, color: colors.text, fontWeight: '700' },
  sunday: { color: colors.error },
  saturday: { color: colors.brand },
  remaining: { ...typography.label, color: colors.text },
  small: { ...typography.caption, color: colors.textMuted },
});
