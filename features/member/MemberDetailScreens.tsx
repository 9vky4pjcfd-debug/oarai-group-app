import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { EmptyState, Screen, SectionHeader } from '@/components/design-system';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { PageHeader } from '@/components/PageHeader';
import { colors, radii, spacing, typography } from '@/constants';

export function MemberQrScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('member.qr')} backLabel={t('common.back')} /><SectionHeader eyebrow="MEMBER" title={t('member.qr')} description={t('member.qrDescription')} /><View style={styles.qr}><Ionicons color={colors.brand} name="qr-code-outline" size={180} /><Text style={styles.demo}>{t('member.demoQr')}</Text></View></Screen>;
}

export function PointsScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('member.points')} backLabel={t('common.back')} /><SectionHeader eyebrow="POINTS" title={t('member.points')} /><PlaceholderPanel icon="sparkles-outline" title={t('member.currentPoints')} description={t('member.pointsPhaseNotice')} /></Screen>;
}

export function PointHistoryScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('member.history')} backLabel={t('common.back')} /><SectionHeader eyebrow="HISTORY" title={t('member.history')} /><EmptyState title={t('state.empty')} message={t('member.historyPhaseNotice')} /></Screen>;
}

export function CouponsScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('member.coupons')} backLabel={t('common.back')} /><SectionHeader eyebrow="COUPONS" title={t('member.coupons')} /><EmptyState title={t('state.empty')} message={t('member.couponsPhaseNotice')} /></Screen>;
}

const styles = StyleSheet.create({ qr: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.md, padding: spacing.xl }, demo: { ...typography.caption, color: colors.textMuted } });
