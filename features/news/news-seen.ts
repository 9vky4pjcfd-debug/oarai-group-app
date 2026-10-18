import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAllNotices } from '@/features/content';

// When the guest last opened the notice list, so the header bell can show a dot for anything newer.
const storageKey = 'oarai.news.lastSeenAt';
const canStore = () => Platform.OS !== 'web' || typeof window !== 'undefined';

let lastSeenAt: string | null | undefined; // undefined: not loaded yet
const listeners = new Set<(value: string | null) => void>();

function publish(value: string | null) {
  lastSeenAt = value;
  listeners.forEach((listener) => listener(value));
}

async function loadLastSeen() {
  if (lastSeenAt !== undefined || !canStore()) return;
  publish(await AsyncStorage.getItem(storageKey).catch(() => null));
}

export function markNewsSeen() {
  const now = new Date().toISOString();
  publish(now);
  if (canStore()) void AsyncStorage.setItem(storageKey, now).catch(() => undefined);
}

/** True when a notice was published after the guest last opened the list (or they never have). */
export function useHasUnreadNews() {
  const notices = useAllNotices();
  const [seen, setSeen] = useState(lastSeenAt);
  useEffect(() => {
    listeners.add(setSeen);
    void loadLastSeen();
    return () => { listeners.delete(setSeen); };
  }, []);
  if (seen === undefined || notices.status !== 'ready') return false;
  return notices.data.some((notice) => seen === null || notice.publishedAt > seen);
}
