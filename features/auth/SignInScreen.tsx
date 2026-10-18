import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/FormField';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Screen, SectionHeader } from '@/components/design-system';
import { colors, spacing, typography } from '@/constants';
import { services } from '@/services';
import { authErrorKey, isValidEmail, memberLanguage, MIN_PASSWORD_LENGTH, safeRedirect } from './auth-ui';

type Mode = 'sign-in' | 'sign-up' | 'reset';
type Field = 'displayName' | 'email' | 'password' | 'confirm';

export function SignInScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const redirect = safeRedirect(params.redirect);
  const [mode, setMode] = useState<Mode>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState<'reset-sent' | 'signed-up' | null>(null);

  const trimmedEmail = email.trim();
  const fieldErrors: Partial<Record<Field, string>> = {};
  if (mode === 'sign-up' && !displayName.trim()) fieldErrors.displayName = t('auth.errors.displayNameRequired');
  if (!isValidEmail(trimmedEmail)) fieldErrors.email = t('auth.errors.emailInvalid');
  if (mode === 'sign-in' && !password) fieldErrors.password = t('auth.errors.passwordRequired');
  if (mode === 'sign-up' && password.length < MIN_PASSWORD_LENGTH) fieldErrors.password = t('auth.errors.passwordTooShort');
  if (mode === 'sign-up' && confirm !== password) fieldErrors.confirm = t('auth.errors.passwordMismatch');
  const errorFor = (field: Field) => (touched ? fieldErrors[field] : undefined);

  const switchMode = (next: Mode) => {
    setMode(next);
    setTouched(false);
    setFailure(null);
    setDone(null);
    setPassword('');
    setConfirm('');
  };

  const leave = () => {
    if (redirect) router.replace(redirect);
    else if (router.canGoBack()) router.back();
    else router.replace('/account');
  };

  const submit = async () => {
    setTouched(true);
    if (Object.keys(fieldErrors).length > 0) return;
    setSubmitting(true);
    setFailure(null);
    try {
      if (mode === 'sign-in') {
        await services.auth.signInWithEmail(trimmedEmail, password);
        leave();
      } else if (mode === 'sign-up') {
        await services.auth.signUpWithEmail(trimmedEmail, password, displayName.trim());
        // The membership gate retries this later if it fails here, so the new account is never stuck.
        await services.member.ensureProfile({ displayName: displayName.trim(), preferredLanguage: memberLanguage(i18n.resolvedLanguage ?? i18n.language) }).catch(() => undefined);
        setPassword('');
        setConfirm('');
        setDone('signed-up');
      } else {
        await services.auth.sendPasswordReset(trimmedEmail);
        setDone('reset-sent');
      }
    } catch (error) {
      // Firebase does not reveal whether an address is registered; neither do we.
      if (mode === 'reset' && authErrorKey(error) === 'auth.errors.invalidCredential') setDone('reset-sent');
      else setFailure(t(authErrorKey(error)));
    } finally {
      setSubmitting(false);
    }
  };

  const title = t(mode === 'sign-in' ? 'auth.signInTitle' : mode === 'sign-up' ? 'auth.signUpTitle' : 'auth.resetTitle');
  const description = t(mode === 'sign-in' ? 'auth.signInDescription' : mode === 'sign-up' ? 'auth.signUpDescription' : 'auth.resetDescription');
  const header = <><PageHeader title={title} backLabel={t('common.back')} /><SectionHeader eyebrow="ACCOUNT" title={title} {...(done ? {} : { description })} /></>;

  if (done === 'signed-up') {
    return (
      <Screen>
        {header}
        <Card style={[styles.card, styles.center]}>
          <Ionicons color={colors.success} name="mail-outline" size={36} />
          <Text style={styles.heading}>{t('auth.signUpDoneTitle')}</Text>
          <Text style={styles.centerBody}>{t('auth.signUpDoneMessage', { email: trimmedEmail })}</Text>
        </Card>
        <Button label={t('auth.continue')} onPress={leave} />
      </Screen>
    );
  }

  if (done === 'reset-sent') {
    return (
      <Screen>
        {header}
        <Card style={[styles.card, styles.center]}>
          <Ionicons color={colors.accent} name="mail-outline" size={36} />
          <Text accessibilityLiveRegion="polite" style={styles.centerBody}>{t('auth.resetSent')}</Text>
        </Card>
        <Button label={t('auth.backToSignIn')} variant="secondary" onPress={() => switchMode('sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      {header}
      <Card style={styles.card}>
        {mode === 'sign-up' ? <FormField label={t('auth.displayName')} error={errorFor('displayName')} value={displayName} onChangeText={setDisplayName} autoComplete="name" textContentType="name" /> : null}
        <FormField label={t('auth.email')} error={errorFor('email')} value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" autoCorrect={false} keyboardType="email-address" textContentType={mode === 'sign-up' ? 'username' : 'emailAddress'} />
        {mode !== 'reset' ? (
          <FormField label={t('auth.password')} error={errorFor('password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} textContentType={mode === 'sign-up' ? 'newPassword' : 'password'} placeholder={mode === 'sign-up' ? t('auth.passwordHint') : undefined} />
        ) : null}
        {mode === 'sign-up' ? <FormField label={t('auth.confirmPassword')} error={errorFor('confirm')} value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" /> : null}
        {failure ? <Text accessibilityLiveRegion="assertive" style={styles.error}>{failure}</Text> : null}
        <Button label={t(mode === 'sign-in' ? 'auth.signIn' : mode === 'sign-up' ? 'auth.signUp' : 'auth.sendReset')} loading={submitting} onPress={() => void submit()} />
      </Card>
      {mode === 'sign-in' ? <Button label={t('auth.forgotPassword')} variant="ghost" onPress={() => switchMode('reset')} /> : null}
      <Button label={t(mode === 'sign-in' ? 'auth.toSignUp' : mode === 'sign-up' ? 'auth.toSignIn' : 'auth.backToSignIn')} variant={mode === 'reset' ? 'ghost' : 'secondary'} onPress={() => switchMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  center: { alignItems: 'center' },
  heading: { ...typography.heading, color: colors.text, textAlign: 'center' },
  centerBody: { ...typography.body, color: colors.text, textAlign: 'center' },
  error: { ...typography.caption, color: colors.error },
});
