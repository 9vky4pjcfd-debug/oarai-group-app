import { useTranslation } from 'react-i18next';
import { MenuRow } from '@/components/MenuRow';
import { PageHeader } from '@/components/PageHeader';
import { Badge, Card, Screen, SectionHeader } from '@/components/design-system';

export function CrowdStatusScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <PageHeader title={t('facilities.crowd')} backLabel={t('common.back')} />
      <SectionHeader eyebrow="LIVE STATUS" title={t('facilities.crowd')} description={t('facilities.demoNotice')} />
      <MenuRow icon="restaurant-outline" title={t('facilities.restaurantStatus')} description={t('facilities.waitingParties', { count: 3 })} href="/(tabs)/facilities/restaurant-status" />
      <MenuRow icon="water-outline" title={t('facilities.bathStatus')} description={t('facilities.quiet')} href="/(tabs)/facilities/bath-status" />
      <Card><Badge label={t('facilities.demoBadge')} /></Card>
    </Screen>
  );
}
