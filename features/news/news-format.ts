import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useNewsFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const date = useCallback((iso: string) => new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Tokyo' }), [locale]);
  return { date };
}
