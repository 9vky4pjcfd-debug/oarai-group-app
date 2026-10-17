import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createMemoryStore, type KeyValueStore } from './mock-storage';

/** Device storage for demo data, so mock bookings survive an app restart. Falls back to memory during the static web build. */
export function createDeviceStore(): KeyValueStore {
  if (Platform.OS === 'web' && typeof window === 'undefined') return createMemoryStore();
  return { getItem: (key) => AsyncStorage.getItem(key), setItem: (key, value) => AsyncStorage.setItem(key, value) };
}
