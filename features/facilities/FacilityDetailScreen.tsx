import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContentGate } from '@/components/ContentGate';
import { DetailLayout } from '@/components/DetailLayout';
import { Card, Screen } from '@/components/design-system';
import { PageHeader } from '@/components/PageHeader';
import { colors, DEFAULT_HOTEL_ID, spacing, typography } from '@/constants';
import { useFacility, useLocalized } from '@/features/content';
import { resolveContentImage } from '@/features/hotel/content-utils';

export function FacilityDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const l = useLocalized();
  const facility = useFacility(DEFAULT_HOTEL_ID, id);
  if (facility.status !== 'ready' || !facility.data) {
    return <Screen><PageHeader title={t('facilities.detail')} backLabel={t('common.back')} /><ContentGate state={facility} onRetry={facility.reload}>{() => null}</ContentGate></Screen>;
  }
  const data = facility.data;
  const image = data.images[0];
  return (
    <DetailLayout image={image ? resolveContentImage(image) : undefined} title={l(data.name)} description={l(data.description)}>
      {data.location || data.businessHours ? (
        <Card style={styles.card}>
          {data.location ? <Info label={t('facilities.location')} value={l(data.location)} /> : null}
          {data.location && data.businessHours ? <View style={styles.divider} /> : null}
          {data.businessHours ? <Info label={t('facilities.hours')} value={l(data.businessHours)} /> : null}
        </Card>
      ) : null}
    </DetailLayout>
  );
}
function Info({ label, value }: { label: string; value: string }) { return <View style={styles.info}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ card: { gap: spacing.md }, info: { gap: spacing.xxs }, label: { ...typography.caption, color: colors.textMuted }, value: { ...typography.body, color: colors.text }, divider: { backgroundColor: colors.border, height: 1 } });
