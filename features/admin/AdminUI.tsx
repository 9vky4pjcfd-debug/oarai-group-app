import { router, type Href } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { PageHeader } from '@/components/PageHeader';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { Button, Card, EmptyState, LoadingState, Screen, SectionHeader } from '@/components/design-system';
import { colors, radii, spacing, typography } from '@/constants';
import { useAuthState } from '@/features/auth/AuthProvider';
import { useHotels } from '@/features/content';
import { services } from '@/services';
import type { HotelPublicProfile, StaffRole, User } from '@/types';
import { adminErrorKey, hasRole, managedHotels } from './admin-rules';

export const adminSignInHref = '/account/sign-in?redirect=/account/admin' as Href;

export function AdminScreen({ eyebrow = 'HOTEL STAFF', title, description, children }: { eyebrow?: string; title: string; description?: string; children: ReactNode }) {
  const { t } = useTranslation();
  return <Screen keyboardShouldPersistTaps="handled"><PageHeader title={title} backLabel={t('common.back')} /><SectionHeader eyebrow={eyebrow} title={title} {...(description ? { description } : {})} />{children}</Screen>;
}

/** Shows the right panel until the signed-in user holds at least `minimum`, then renders `children`. */
export function AdminGate({ minimum, children, noAccess }: { minimum: StaffRole; children: (user: User) => ReactNode; noAccess?: (user: User) => ReactNode }) {
  const { t } = useTranslation();
  const auth = useAuthState();
  if (!services.admin.available) return <PlaceholderPanel icon="cloud-offline-outline" title={t('admin.unavailableTitle')} description={t('admin.unavailable')} />;
  if (auth.status === 'loading') return <LoadingState label={t('state.loading')} />;
  if (auth.status === 'unauthenticated') {
    return (
      <View style={styles.stack}>
        <PlaceholderPanel icon="person-circle-outline" title={t('admin.signInTitle')} description={t('admin.signInRequired')} />
        <Button label={t('admin.signIn')} onPress={() => router.push(adminSignInHref)} />
      </View>
    );
  }
  const user = auth.session.user;
  if (!hasRole(user, minimum)) {
    if (noAccess) return <>{noAccess(user)}</>;
    return (
      <View style={styles.stack}>
        <PlaceholderPanel icon="lock-closed-outline" title={t('admin.noAccessTitle')} description={t('admin.noAccessScreen')} />
        <Button label={t('admin.backToMenu')} variant="secondary" onPress={() => router.replace('/account/admin' as Href)} />
      </View>
    );
  }
  return <>{children(user)}</>;
}

/** Loads the hotels the user may manage and hands them to `children`. */
export function HotelScope({ user, children }: { user: User; children: (hotels: HotelPublicProfile[]) => ReactNode }) {
  const { t } = useTranslation();
  const hotels = useHotels();
  return (
    <ContentGate state={hotels} onRetry={hotels.reload}>
      {(list) => {
        const allowed = managedHotels(user, list);
        return allowed.length === 0 ? <EmptyState title={t('admin.noHotels')} message={t('admin.noHotelsMessage')} /> : children(allowed);
      }}
    </ContentGate>
  );
}

/** Explains a refused admin call in the current language. */
export function useAdminError() {
  const { t } = useTranslation();
  return useCallback((error: unknown) => {
    const { key, reason } = adminErrorKey(error);
    const message = t(`admin.errors.${key}`);
    return reason ? `${message} ${t('admin.errors.reasonCode', { reason })}` : message;
  }, [t]);
}

export function Chip({ label, selected, onPress, disabled }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[styles.chip, selected && styles.chipActive, disabled && styles.disabled]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ label, children }: { label?: string; children: ReactNode }) {
  return <View style={styles.field}>{label ? <Text style={styles.fieldLabel}>{label}</Text> : null}<View style={styles.chips}>{children}</View></View>;
}

export function Message({ text, tone }: { text: string | null; tone: 'error' | 'success' }) {
  return text ? <Text accessibilityLiveRegion="polite" style={[styles.message, tone === 'error' ? styles.error : styles.success]}>{text}</Text> : null;
}

/** Inline "are you sure" card, as on the reservation detail screen; works the same on web and native. */
export function ConfirmCard({ message, confirmLabel, cancelLabel, loading, onConfirm, onCancel }: { message: string; confirmLabel: string; cancelLabel: string; loading: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Card style={styles.confirm}>
      <Text style={styles.body}>{message}</Text>
      <Button label={confirmLabel} loading={loading} onPress={onConfirm} style={styles.danger} />
      <Button label={cancelLabel} variant="ghost" onPress={onCancel} />
    </Card>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text selectable style={styles.rowValue}>{value}</Text></View>;
}

export const adminStyles = StyleSheet.create({
  card: { gap: spacing.sm },
  heading: { ...typography.heading, color: colors.text },
  label: { ...typography.label, color: colors.text },
  muted: { ...typography.caption, color: colors.textMuted },
  body: { ...typography.body, color: colors.text },
  rowWrap: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  fieldItem: { flexBasis: 200, flexGrow: 1 },
});

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  field: { gap: spacing.xxs },
  fieldLabel: { ...typography.caption, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, minHeight: 36, justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xxs },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipLabel: { ...typography.label, color: colors.text },
  chipLabelActive: { color: colors.white },
  disabled: { opacity: 0.45 },
  message: { ...typography.label },
  error: { color: colors.error },
  success: { color: colors.success },
  confirm: { gap: spacing.sm, borderColor: colors.error },
  body: { ...typography.body, color: colors.text },
  danger: { backgroundColor: colors.error, borderRadius: radii.pill },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowLabel: { ...typography.caption, color: colors.textMuted, paddingTop: 3, width: 96 },
  rowValue: { ...typography.body, color: colors.text, flex: 1 },
});
