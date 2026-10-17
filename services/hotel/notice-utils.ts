import type { Notice } from '@/types';

/** Drops notices that are scheduled for later or already expired, then sorts newest first (important ones first on the same day). */
export function visibleNotices(notices: readonly Notice[], now: number): Notice[] {
  return notices
    .filter((notice) => Date.parse(notice.publishedAt) <= now && (!notice.expiresAt || Date.parse(notice.expiresAt) > now))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || (a.priority === b.priority ? a.sortOrder - b.sortOrder : a.priority === 'important' ? -1 : 1));
}

/** `all` = everything, `group` = group-wide only, otherwise a hotelId (its own notices plus group-wide ones). */
export type NoticeFilter = 'all' | 'group' | (string & {});

export function filterNotices(notices: readonly Notice[], filter: NoticeFilter): Notice[] {
  if (filter === 'all') return [...notices];
  if (filter === 'group') return notices.filter((notice) => notice.hotelId === null);
  return notices.filter((notice) => notice.hotelId === filter || notice.hotelId === null);
}
