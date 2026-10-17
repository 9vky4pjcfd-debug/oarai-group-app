import { useTranslation } from 'react-i18next';
import { MenuRow } from '@/components/MenuRow';
import { PageHeader } from '@/components/PageHeader';
import { Screen, SectionHeader } from '@/components/design-system';

export function AccountScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('account.title')} backLabel={t('common.back')} /><SectionHeader eyebrow="ACCOUNT" title={t('account.title')} /><MenuRow icon="language-outline" title={t('account.language')} href="/account/language" /></Screen>;
}
