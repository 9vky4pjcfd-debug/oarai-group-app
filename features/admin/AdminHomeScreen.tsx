import { type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MenuRow } from '@/components/MenuRow';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { Button, Card } from '@/components/design-system';
import { spacing } from '@/constants';
import { services } from '@/services';
import { serverRefusalReason } from '@/services/errors/error-mapper';
import { AppError, type SeedResult, type User } from '@/types';
import { hasRole } from './admin-rules';
import { AdminGate, AdminScreen, ConfirmCard, Message, adminStyles, useAdminError } from './AdminUI';

export function AdminHomeScreen() {
  const { t } = useTranslation();
  return (
    <AdminScreen title={t('admin.title')} description={t('admin.description')}>
      <AdminGate minimum="staff" noAccess={(user) => <NoAccess user={user} />}>{(user) => <Menu user={user} />}</AdminGate>
    </AdminScreen>
  );
}

function NoAccess({ user }: { user: User }) {
  const { t } = useTranslation();
  const errorText = useAdminError();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const claim = async () => {
    setBusy(true);
    setError(null);
    try {
      await services.admin.claimOwner();
      setDone(true);
      await services.auth.refreshSession();
    } catch (caught) {
      const reason = serverRefusalReason(caught);
      if (reason === 'email-not-verified') setError(t('admin.ownerUnverified'));
      else if (caught instanceof AppError && caught.code === 'PERMISSION_DENIED') setError(t('admin.ownerDenied'));
      else setError(errorText(caught));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.stack}>
      <PlaceholderPanel icon="lock-closed-outline" title={t('admin.noAccessTitle')} description={t('admin.noAccess')} />
      <Text style={adminStyles.muted}>{t('admin.signedInAs', { email: user.email ?? '-' })}</Text>
      <Card style={adminStyles.card}>
        <Text style={adminStyles.label}>{t('admin.ownerTitle')}</Text>
        <Text style={adminStyles.muted}>{t('admin.ownerHint')}</Text>
        <Message text={error} tone="error" />
        <Message text={done && !error ? t('admin.ownerDone') : null} tone="success" />
        <Button label={t('admin.ownerSetup')} variant="secondary" loading={busy} onPress={claim} />
      </Card>
    </View>
  );
}

function Menu({ user }: { user: User }) {
  const { t } = useTranslation();
  const link = (path: string) => `/account/admin/${path}` as Href;
  return (
    <View style={styles.stack}>
      <Text style={adminStyles.muted}>{t('admin.signedInAsRole', { email: user.email ?? '-', role: t(`admin.roles.${user.role}`) })}</Text>
      <MenuRow icon="bed-outline" title={t('admin.menu.inventory')} description={t('admin.menu.inventoryDescription')} href={link('inventory')} />
      <MenuRow icon="calendar-outline" title={t('admin.menu.reservations')} description={t('admin.menu.reservationsDescription')} href={link('reservations')} />
      <MenuRow icon="megaphone-outline" title={t('admin.menu.notices')} description={t('admin.menu.noticesDescription')} href={link('notices')} />
      {hasRole(user, 'manager') ? <MenuRow icon="mail-outline" title={t('admin.menu.contacts')} description={t('admin.menu.contactsDescription')} href={link('contacts')} /> : null}
      {hasRole(user, 'admin') ? <MenuRow icon="people-outline" title={t('admin.menu.staff')} description={t('admin.menu.staffDescription')} href={link('staff')} /> : null}
      {hasRole(user, 'admin') ? <SeedCard /> : null}
    </View>
  );
}

function SeedCard() {
  const { t } = useTranslation();
  const errorText = useAdminError();
  const [busy, setBusy] = useState<'keep' | 'overwrite' | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seed = async (overwrite: boolean) => {
    setBusy(overwrite ? 'overwrite' : 'keep');
    setError(null);
    setResult(null);
    try {
      setResult(await services.admin.seedContent(overwrite));
      setConfirming(false);
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusy(null);
    }
  };
  return (
    <Card style={adminStyles.card}>
      <Text style={adminStyles.label}>{t('admin.seed.title')}</Text>
      <Text style={adminStyles.muted}>{t('admin.seed.description')}</Text>
      <Message text={result ? t('admin.seed.result', { written: result.written, skipped: result.skipped }) : null} tone="success" />
      <Message text={error} tone="error" />
      <Button label={t('admin.seed.run')} loading={busy === 'keep'} disabled={busy !== null} onPress={() => seed(false)} />
      {confirming
        ? <ConfirmCard message={t('admin.seed.overwriteConfirm')} confirmLabel={t('admin.seed.overwriteYes')} cancelLabel={t('admin.cancel')} loading={busy === 'overwrite'} onConfirm={() => seed(true)} onCancel={() => setConfirming(false)} />
        : <Button label={t('admin.seed.overwrite')} variant="secondary" disabled={busy !== null} onPress={() => setConfirming(true)} />}
    </Card>
  );
}

const styles = StyleSheet.create({ stack: { gap: spacing.md } });
