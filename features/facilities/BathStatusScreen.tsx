import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Screen, SectionHeader } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, spacing, typography } from '@/constants';

export function BathStatusScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('facilities.bathStatus')} backLabel={t('common.back')} /><SectionHeader eyebrow="PUBLIC BATH" title={t('facilities.bathStatus')} description={t('facilities.demoNotice')} /><Card style={styles.card}><Badge label={t('facilities.quiet')} tone="success" /><Text style={styles.title}>{t('facilities.comfortableNow')}</Text></Card></Screen>;
}
const styles = StyleSheet.create({ card: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }, title: { ...typography.title, color: colors.brand, textAlign: 'center' } });
