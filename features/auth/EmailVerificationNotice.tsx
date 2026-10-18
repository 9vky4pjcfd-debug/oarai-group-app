import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@/components/design-system';
import { colors, spacing, typography } from '@/constants';
import { services } from '@/services';
import { authErrorKey } from './auth-ui';

/** Asks a signed-in user with an unverified email to open the link we sent, with resend and re-check actions. */
export function EmailVerificationNotice({ email, message }: { email: string | null; message?: string }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<'resend' | 'refresh' | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  const run = async (action: 'resend' | 'refresh') => {
    setBusy(action);
    setFeedback(null);
    try {
      if (action === 'resend') {
        await services.auth.sendEmailVerification();
        setFeedback({ text: t('auth.verify.resent'), error: false });
      } else {
        const session = await services.auth.refreshSession();
        if (!session?.user.emailVerified) setFeedback({ text: t('auth.verify.stillUnverified'), error: true });
      }
    } catch (error) {
      setFeedback({ text: t(authErrorKey(error)), error: true });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}><Ionicons color={colors.warning} name="mail-unread-outline" size={24} /><Text style={styles.title}>{t('auth.verify.title')}</Text></View>
      {message ? <Text style={styles.body}>{message}</Text> : null}
      <Text style={styles.body}>{t('auth.verify.message', { email: email ?? '' })}</Text>
      {feedback ? <Text accessibilityLiveRegion="polite" style={feedback.error ? styles.error : styles.success}>{feedback.text}</Text> : null}
      <Button label={t('auth.verify.verified')} loading={busy === 'refresh'} disabled={busy !== null} onPress={() => void run('refresh')} />
      <Button label={t('auth.verify.resend')} variant="secondary" loading={busy === 'resend'} disabled={busy !== null} onPress={() => void run('resend')} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: colors.warning, gap: spacing.sm },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  title: { ...typography.label, color: colors.text, flex: 1 },
  body: { ...typography.body, color: colors.text },
  error: { ...typography.caption, color: colors.error },
  success: { ...typography.caption, color: colors.success },
});
