import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Locale-aware number and date formatting for membership screens. */
export function useMemberFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const points = useCallback((value: number) => value.toLocaleString(locale), [locale]);
  const signedPoints = useCallback((value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toLocaleString(locale)}`, [locale]);
  const date = useCallback((iso: string) => new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Tokyo' }), [locale]);
  return { points, signedPoints, date };
}
