import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MenuRow } from '@/components/MenuRow';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Screen, SectionHeader } from '@/components/design-system';
import { environmentConfig } from '@/config';
import { colors, radii, spacing, typography } from '@/constants';
import { useAuthState } from '@/features/auth/AuthProvider';
import { authErrorKey } from '@/features/auth/auth-ui';
import { EmailVerificationNotice } from '@/features/auth/EmailVerificationNotice';
import { SignInPrompt } from '@/features/auth/SignInPrompt';
import { services } from '@/services';
import type { User } from '@/types';

const staffRoles: User['role'][] = ['staff', 'manager', 'admin'];

export function AccountScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <PageHeader title={t('account.title')} backLabel={t('common.back')} />
      <SectionHeader eyebrow="ACCOUNT" title={t('account.title')} />
      {environmentConfig.backendMode === 'firebase' ? <MemberAccount /> : null}
      <MenuRow icon="language-outline" title={t('account.language')} href="/account/language" />
    </Screen>
  );
}

function MemberAccount() {
  const { t } = useTranslation();
  const auth = useAuthState();
  if (auth.status === 'loading') return null;
  if (auth.status === 'unauthenticated') return <SignInPrompt title={t('auth.account.signedOutTitle')} description={t('auth.account.signedOutDescription')} />;
  return <SignedIn user={auth.session.user} />;
}

function SignedIn({ user }: { user: User }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<'sign-out' | 'delete' | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const run = async (action: 'sign-out' | 'delete') => {
    setBusy(action);
    setFailure(null);
    try {
      if (action === 'sign-out') await services.auth.signOut();
      else await services.auth.deleteAccount();
      setConfirmingDelete(false);
    } catch (error) {
      setFailure(t(authErrorKey(error)));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Card style={styles.card}>
        <Text style={styles.caption}>{t('auth.account.profile')}</Text>
        <Text style={styles.name}>{user.displayName?.trim() || t('auth.account.noName')}</Text>
        {user.email ? <Text selectable style={styles.body}>{user.email}</Text> : null}
      </Card>
      {!user.emailVerified ? <EmailVerificationNotice email={user.email} /> : null}
      {staffRoles.includes(user.role) ? <MenuRow icon="briefcase-outline" title={t('auth.account.hotelTools')} description={t('auth.account.hotelToolsDescription')} href="/account/admin" /> : null}
      {failure && !confirmingDelete ? <Text accessibilityLiveRegion="assertive" style={styles.error}>{failure}</Text> : null}
      <Button label={t('auth.account.signOut')} variant="secondary" loading={busy === 'sign-out'} disabled={busy !== null} onPress={() => void run('sign-out')} />
      {confirmingDelete ? (
        <Card style={styles.card}>
          <Text style={styles.body}>{t('auth.account.deleteConfirm')}</Text>
          {failure ? <Text accessibilityLiveRegion="assertive" style={styles.error}>{failure}</Text> : null}
          <Button label={t('auth.account.deleteYes')} loading={busy === 'delete'} disabled={busy !== null} onPress={() => void run('delete')} style={styles.danger} />
          <Button label={t('auth.account.deleteNo')} variant="ghost" disabled={busy !== null} onPress={() => { setConfirmingDelete(false); setFailure(null); }} />
        </Card>
      ) : <Button label={t('auth.account.deleteAccount')} variant="ghost" disabled={busy !== null} onPress={() => { setConfirmingDelete(true); setFailure(null); }} />}
    </>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  caption: { ...typography.caption, color: colors.textMuted },
  name: { ...typography.heading, color: colors.text },
  body: { ...typography.body, color: colors.text },
  error: { ...typography.caption, color: colors.error },
  danger: { backgroundColor: colors.error, borderRadius: radii.pill },
});
