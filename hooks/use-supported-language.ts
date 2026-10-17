import { useTranslation } from 'react-i18next';
import { changeLanguage, supportedLanguages, type SupportedLanguage } from '@/i18n';

export function useSupportedLanguage() {
  const { i18n } = useTranslation();
  const language = supportedLanguages.includes(i18n.resolvedLanguage as SupportedLanguage)
    ? (i18n.resolvedLanguage as SupportedLanguage)
    : 'ja';

  return { language, changeLanguage };
}
