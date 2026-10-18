import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance, type LanguageDetectorAsyncModule } from 'i18next';
import { Platform } from 'react-native';
import { initReactI18next } from 'react-i18next';
import { adminText } from './locales/admin';
import { authText } from './locales/auth';
import { en } from './locales/en';
import { ja } from './locales/ja';
import { zhTW } from './locales/zh-TW';

export const supportedLanguages = ['ja', 'zh-TW', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
const languageStorageKey = 'oarai.language';
const i18n = createInstance();

function canUsePersistentStorage() {
  return Platform.OS !== 'web' || typeof window !== 'undefined';
}

function normalizeLanguage(languageTag?: string): SupportedLanguage {
  if (languageTag?.toLowerCase().startsWith('zh')) return 'zh-TW';
  if (languageTag?.toLowerCase().startsWith('en')) return 'en';
  return 'ja';
}

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    const stored = canUsePersistentStorage() ? await AsyncStorage.getItem(languageStorageKey) : null;
    callback(normalizeLanguage(stored ?? getLocales()[0]?.languageTag));
  },
  init: () => undefined,
  cacheUserLanguage: async (language) => {
    if (canUsePersistentStorage()) await AsyncStorage.setItem(languageStorageKey, normalizeLanguage(language));
  },
};

// The static web build pre-renders every page in Japanese. Starting the browser in Japanese too keeps the first
// render identical to that HTML (avoiding a hydration mismatch); `applyDetectedLanguage` switches after mount.
const isWeb = Platform.OS === 'web';
if (!isWeb) i18n.use(languageDetector);

void i18n
  .use(initReactI18next)
  .init({
    ...(isWeb ? { lng: 'ja' } : {}),
    compatibilityJSON: 'v4',
    fallbackLng: 'ja',
    defaultNS: 'translation',
    resources: {
      ja: { translation: { ...ja, auth: authText.ja, admin: adminText.ja } },
      'zh-TW': { translation: { ...zhTW, auth: authText['zh-TW'], admin: adminText['zh-TW'] } },
      en: { translation: { ...en, auth: authText.en, admin: adminText.en } },
    },
    interpolation: { escapeValue: false },
  });

/** Web only: applies the stored or browser language once the pre-rendered page has hydrated. */
export async function applyDetectedLanguage() {
  if (!isWeb || typeof window === 'undefined') return;
  const stored = await AsyncStorage.getItem(languageStorageKey);
  const language = normalizeLanguage(stored ?? getLocales()[0]?.languageTag);
  if (language !== i18n.language) await i18n.changeLanguage(language);
}

export async function changeLanguage(language: SupportedLanguage) {
  await i18n.changeLanguage(language);
  if (canUsePersistentStorage()) await AsyncStorage.setItem(languageStorageKey, language);
}

export default i18n;
