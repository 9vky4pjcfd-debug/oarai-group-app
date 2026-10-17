import { useTranslation } from 'react-i18next';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { PageHeader } from '@/components/PageHeader';
import { Screen, SectionHeader } from '@/components/design-system';

export function ReservationScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('rooms.reservation')} backLabel={t('common.back')} /><SectionHeader eyebrow="RESERVATION" title={t('rooms.reservation')} description={t('rooms.reservationDescription')} /><PlaceholderPanel icon="calendar-outline" title={t('common.comingSoon')} description={t('rooms.reservationPhaseNotice')} /></Screen>;
}
