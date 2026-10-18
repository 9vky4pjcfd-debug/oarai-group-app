import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { FormField } from '@/components/FormField';
import { Badge, Button, Card, EmptyState } from '@/components/design-system';
import { colors, radii, spacing } from '@/constants';
import { useContent, useLocalized } from '@/features/content';
import { useNewsFormat } from '@/features/news/news-format';
import { services } from '@/services';
import type { HotelPublicProfile, StaffMember, StaffUpdate } from '@/types';
import { isEmail } from './admin-rules';
import { AdminGate, AdminScreen, Chip, ChipRow, HotelScope, Message, adminStyles, useAdminError } from './AdminUI';

const roles: StaffUpdate['role'][] = ['staff', 'manager', 'admin', 'none'];

export function StaffScreen() {
  const { t } = useTranslation();
  return (
    <AdminScreen title={t('admin.staff.title')} description={t('admin.staff.description')}>
      <AdminGate minimum="admin">{(user) => <HotelScope user={user}>{(hotels) => <Staff hotels={hotels} />}</HotelScope>}</AdminGate>
    </AdminScreen>
  );
}

function Staff({ hotels }: { hotels: HotelPublicProfile[] }) {
  const { t } = useTranslation();
  const staff = useContent('admin-staff', () => services.admin.listStaff());
  const [editing, setEditing] = useState<{ key: number; member: StaffUpdate }>({ key: 0, member: { email: '', role: 'staff', hotelIds: [] } });
  const edit = (member: StaffUpdate) => setEditing({ key: editing.key + 1, member });
  return (
    <>
      <StaffForm key={editing.key} initial={editing.member} hotels={hotels} onSaved={staff.reload} onClear={() => edit({ email: '', role: 'staff', hotelIds: [] })} />
      <Text style={adminStyles.heading}>{t('admin.staff.listTitle')}</Text>
      <ContentGate state={staff} onRetry={staff.reload}>
        {(list) => list.length === 0
          ? <EmptyState title={t('admin.staff.empty')} />
          : <View style={styles.list}>{[...list].sort((a, b) => a.email.localeCompare(b.email)).map((member) => <StaffRow key={member.uid} member={member} hotels={hotels} onPress={() => edit({ email: member.email, role: member.role, hotelIds: member.hotelIds })} />)}</View>}
      </ContentGate>
    </>
  );
}

function StaffRow({ member, hotels, onPress }: { member: StaffMember; hotels: HotelPublicProfile[]; onPress: () => void }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const format = useNewsFormat();
  const hotelNames = member.role === 'admin' ? t('admin.staff.allHotels') : member.hotelIds.map((id) => { const hotel = hotels.find((item) => item.hotelId === id); return hotel ? l(hotel.name) : id; }).join('、') || '-';
  return (
    <Pressable accessibilityRole="button" accessibilityHint={t('admin.edit')} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={adminStyles.rowWrap}><Text selectable style={adminStyles.label}>{member.email}</Text><Badge label={t(`admin.roles.${member.role}`)} tone={member.role === 'admin' ? 'warning' : 'info'} /></View>
      <Text style={adminStyles.muted}>{hotelNames}</Text>
      {member.updatedAt ? <Text style={adminStyles.muted}>{t('admin.staff.updatedAt', { date: format.date(member.updatedAt) })}</Text> : null}
    </Pressable>
  );
}

function StaffForm({ initial, hotels, onSaved, onClear }: { initial: StaffUpdate; hotels: HotelPublicProfile[]; onSaved: () => void; onClear: () => void }) {
  const { t } = useTranslation();
  const l = useLocalized();
  const errorText = useAdminError();
  const [email, setEmail] = useState(initial.email);
  const [role, setRole] = useState(initial.role);
  const [hotelIds, setHotelIds] = useState(initial.hotelIds);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const needsHotels = role === 'staff' || role === 'manager';
  const errors = {
    email: isEmail(email) ? undefined : t('admin.validation.email'),
    hotels: needsHotels && hotelIds.length === 0 ? t('admin.validation.noHotels') : undefined,
  };

  const save = async () => {
    setSubmitted(true);
    setSaved(null);
    setError(null);
    if (errors.email || errors.hotels) return;
    setSaving(true);
    try {
      const address = email.trim();
      await services.admin.setStaff({ email: address, role, hotelIds: needsHotels ? hotelIds : [] });
      setSaved(t(role === 'none' ? 'admin.staff.removed' : 'admin.staff.saved', { email: address }));
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
      <Text style={adminStyles.label}>{initial.email ? t('admin.staff.editTitle') : t('admin.staff.addTitle')}</Text>
      <Text style={adminStyles.muted}>{t('admin.staff.accountHint')}</Text>
      <FormField label={t('admin.staff.email')} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="off" error={submitted ? errors.email : undefined} />
      <ChipRow label={t('admin.staff.role')}>
        {roles.map((value) => <Chip key={value} label={t(`admin.roles.${value}`)} selected={role === value} onPress={() => setRole(value)} />)}
      </ChipRow>
      <Text style={adminStyles.muted}>{t(`admin.staff.roleHints.${role}`)}</Text>
      {needsHotels ? (
        <ChipRow label={t('admin.staff.hotels')}>
          {hotels.map((hotel) => <Chip key={hotel.hotelId} label={l(hotel.name)} selected={hotelIds.includes(hotel.hotelId)} onPress={() => setHotelIds(hotelIds.includes(hotel.hotelId) ? hotelIds.filter((id) => id !== hotel.hotelId) : [...hotelIds, hotel.hotelId])} />)}
        </ChipRow>
      ) : null}
      <Message text={submitted ? errors.hotels ?? null : null} tone="error" />
      <Message text={error} tone="error" />
      <Message text={saved} tone="success" />
      {saved ? <Text style={adminStyles.muted}>{t('admin.staff.reloginHint')}</Text> : null}
      <Button label={t('admin.save')} loading={saving} onPress={save} />
      {initial.email || email ? <Button label={t('admin.staff.clear')} variant="ghost" onPress={onClear} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, gap: spacing.xxs, padding: spacing.md },
  pressed: { opacity: 0.78 },
});
