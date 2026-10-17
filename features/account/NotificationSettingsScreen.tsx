import { useTranslation } from 'react-i18next';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { PageHeader } from '@/components/PageHeader';
import { Screen, SectionHeader } from '@/components/design-system';

export function NotificationSettingsScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('notifications.title')} backLabel={t('common.back')} /><SectionHeader eyebrow="NOTIFICATIONS" title={t('notifications.title')} /><PlaceholderPanel icon="notifications-outline" title={t('common.comingSoon')} description={t('notifications.unavailable')} /></Screen>;
}
