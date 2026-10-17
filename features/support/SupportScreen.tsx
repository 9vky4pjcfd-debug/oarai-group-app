import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { MenuRow } from '@/components/MenuRow';
import { Screen, SectionHeader } from '@/components/design-system';

export function SupportScreen() {
  const { t } = useTranslation();
  return <Screen><AppHeader /><SectionHeader eyebrow="SUPPORT" title={t('support.title')} description={t('support.subtitle')} /><MenuRow icon="help-circle-outline" title={t('support.faq')} href="/(tabs)/support/faq" /><MenuRow icon="call-outline" title={t('support.contact')} description={t('ui.contactIntro')} href="/(tabs)/support/contact" /></Screen>;
}
