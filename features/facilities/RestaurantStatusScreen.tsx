import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Screen, SectionHeader } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, spacing, typography } from '@/constants';

export function RestaurantStatusScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('facilities.restaurantStatus')} backLabel={t('common.back')} /><SectionHeader eyebrow="日の出" title={t('facilities.restaurantStatus')} description={t('facilities.demoNotice')} /><Card style={styles.card}><Badge label={t('facilities.shortWait')} tone="warning" /><Text style={styles.number}>3</Text><Text style={styles.label}>{t('facilities.waitingPartiesLabel')}</Text></Card></Screen>;
}
const styles = StyleSheet.create({ card: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl }, number: { fontSize: 64, fontWeight: '700', color: colors.brand }, label: { ...typography.heading, color: colors.text } });
