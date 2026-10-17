import type AsyncStorage from '@react-native-async-storage/async-storage';
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  /** Exported by Firebase's React Native conditional entrypoint. */
  export function getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
}
