import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '@/features/hotel/content-utils';
import { services } from '@/services';
import type { LocalizedText } from '@/types';

export type ContentState<T> =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: T }
  | { status: 'error'; data: null };

/** Loads published hotel content through the service layer. `key` must change whenever the loader's inputs change. */
export function useContent<T>(key: string, loader: (forceRefresh: boolean) => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${key}#${attempt}`;
  const [result, setResult] = useState<{ requestKey: string; state: ContentState<T> } | null>(null);

  useEffect(() => {
    let active = true;
    loader(attempt > 0)
      .then((data) => { if (active) setResult({ requestKey, state: { status: 'ready', data } }); })
      .catch(() => { if (active) setResult({ requestKey, state: { status: 'error', data: null } }); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const state: ContentState<T> = result?.requestKey === requestKey ? result.state : { status: 'loading', data: null };
  return { ...state, reload };
}

const refresh = (forceRefresh: boolean) => ({ forceRefresh });

export const useHotels = () => useContent('hotels', (force) => services.hotelContent.getHotels(refresh(force)));
export const useHotel = (hotelId: string) => useContent(`hotel:${hotelId}`, (force) => services.hotelContent.getHotelContent(hotelId, refresh(force)));
export const useRooms = (hotelId: string) => useContent(`rooms:${hotelId}`, (force) => services.hotelContent.getRooms(hotelId, refresh(force)));
export const useRoom = (hotelId: string, roomId: string) => useContent(`room:${hotelId}:${roomId}`, (force) => services.hotelContent.getRoom(hotelId, roomId, refresh(force)));
export const useAllNotices = () => useContent('notices', (force) => services.hotelContent.getAllNotices(refresh(force)));
export const useNotice = (noticeId: string) => useContent(`notice:${noticeId}`, async (force) => (await services.hotelContent.getAllNotices(refresh(force))).find((item) => item.noticeId === noticeId) ?? null);
export const useFacilities = (hotelId: string) => useContent(`facilities:${hotelId}`, (force) => services.hotelContent.getFacilities(hotelId, refresh(force)));
export const useFacility = (hotelId: string, facilityId: string) => useContent(`facility:${hotelId}:${facilityId}`, (force) => services.hotelContent.getFacility(hotelId, facilityId, refresh(force)));
export const useFaq = (hotelId: string) => useContent(`faq:${hotelId}`, (force) => services.hotelContent.getFaq(hotelId, refresh(force)));

/** Returns a translator for content-managed (Firestore / mock) text in the current UI language. */
export function useLocalized() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  return useCallback((value: LocalizedText | undefined) => getLocalizedText(value, language), [language]);
}
