import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { MenuRow } from '@/components/MenuRow';
import { Card, Screen, SectionHeader } from '@/components/design-system';
import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/constants';

export function MemberScreen() {
  const { t } = useTranslation();
  return <Screen><AppHeader /><SectionHeader eyebrow="MEMBERSHIP" title={t('member.title')} description={t('member.subtitle')} /><Card style={styles.balance}><Text style={styles.label}>{t('member.currentPoints')}</Text><Text style={styles.value}>0</Text></Card><MenuRow icon="qr-code-outline" title={t('member.qr')} href="/(tabs)/member/qr" /><MenuRow icon="sparkles-outline" title={t('member.points')} href="/(tabs)/member/points" /><MenuRow icon="time-outline" title={t('member.history')} href="/(tabs)/member/history" /><MenuRow icon="ticket-outline" title={t('member.coupons')} href="/(tabs)/member/coupons" /></Screen>;
}
const styles = StyleSheet.create({ balance: { gap: spacing.xs }, label: { ...typography.caption, color: colors.textMuted }, value: { fontSize: 42, fontWeight: '700', color: colors.brand } });
