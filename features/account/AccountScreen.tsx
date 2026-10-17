import { useTranslation } from 'react-i18next';
import { MenuRow } from '@/components/MenuRow';
import { PageHeader } from '@/components/PageHeader';
import { PlaceholderPanel } from '@/components/PlaceholderPanel';
import { Badge, Screen, SectionHeader } from '@/components/design-system';
import { environmentConfig } from '@/config';

export function AccountScreen() {
  const { t } = useTranslation();
  return <Screen><PageHeader title={t('account.title')} backLabel={t('common.back')} /><SectionHeader eyebrow="ACCOUNT" title={t('account.title')} /><Badge label={`${environmentConfig.name} · ${environmentConfig.backendMode}`} tone={environmentConfig.isProduction ? 'success' : 'info'} /><MenuRow icon="language-outline" title={t('account.language')} href="/account/language" /><MenuRow icon="notifications-outline" title={t('account.notifications')} href="/account/notifications" /><PlaceholderPanel icon="person-outline" title={t('account.profile')} description={t('account.loginFuture')} /></Screen>;
}
