import { useTranslation } from 'react-i18next';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { PageHeader } from '@/components/PageHeader';
import { Screen, SectionHeader } from '@/components/design-system';

export function ContactScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('support.contact')} backLabel={t('common.back')} /><SectionHeader eyebrow="CONTACT" title={t('support.contact')} description={t('support.contactDescription')} /><PlaceholderPanel icon="mail-outline" title={t('common.comingSoon')} description={t('support.contactPhaseNotice')} /></Screen>;
}
