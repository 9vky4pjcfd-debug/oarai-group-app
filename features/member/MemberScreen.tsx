import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { MenuRow } from '@/components/MenuRow';
import { Screen, SectionHeader } from '@/components/design-system';
import { colors, typography } from '@/constants';
import { MembershipCard } from './MembershipCard';
import { MembershipGate } from './MembershipGate';

export function MemberScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppHeader />
      <SectionHeader eyebrow="MEMBERSHIP" title={t('member.title')} description={t('member.subtitle')} />
      <MembershipGate>{(summary) => <MembershipCard summary={summary} />}</MembershipGate>
      <Text style={styles.notice}>{t('member.sharedNotice')}</Text>
      <MenuRow icon="qr-code-outline" title={t('member.qr')} href="/(tabs)/member/qr" />
      <MenuRow icon="sparkles-outline" title={t('member.points')} href="/(tabs)/member/points" />
      <MenuRow icon="time-outline" title={t('member.history')} href="/(tabs)/member/history" />
      <MenuRow icon="ticket-outline" title={t('member.coupons')} href="/(tabs)/member/coupons" />
    </Screen>
  );
}

const styles = StyleSheet.create({ notice: { ...typography.caption, color: colors.textMuted } });
