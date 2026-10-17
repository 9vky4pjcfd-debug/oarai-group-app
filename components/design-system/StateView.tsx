import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/constants';
import { Button } from './Button';

function StateFrame({ title, message, children }: { title: string; message?: string | undefined; children?: React.ReactNode }) {
  return <View style={styles.container}><Text style={styles.title}>{title}</Text>{message ? <Text style={styles.message}>{message}</Text> : null}{children}</View>;
}

export function LoadingState({ label }: { label: string }) { return <StateFrame title={label}><ActivityIndicator color={colors.accent} /></StateFrame>; }
export function EmptyState({ title, message }: { title: string; message?: string }) { return <StateFrame title={title} message={message} />; }
export function ErrorState({ title, message, retryLabel, onRetry }: { title: string; message?: string; retryLabel: string; onRetry: () => void }) { return <StateFrame title={title} message={message}><Button label={retryLabel} variant="secondary" onPress={onRetry} /></StateFrame>; }

const styles = StyleSheet.create({ container: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl }, title: { ...typography.heading, color: colors.text, textAlign: 'center' }, message: { ...typography.body, color: colors.textMuted, textAlign: 'center' } });
