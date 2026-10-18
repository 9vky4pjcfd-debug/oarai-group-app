import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { Button } from '@/components/design-system';
import { spacing } from '@/constants';
import { signInHref } from './auth-ui';

/** The "sign in required" panel with a way forward; `redirect` is where to return after signing in. */
export function SignInPrompt({ title, description, redirect }: { title: string; description: string; redirect?: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.stack}>
      <PlaceholderPanel icon="person-circle-outline" title={title} description={description} />
      <Button label={t('auth.signInPrompt')} onPress={() => router.push(signInHref(redirect))} />
    </View>
  );
}

const styles = StyleSheet.create({ stack: { gap: spacing.md } });
