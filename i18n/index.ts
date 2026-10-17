import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance, type LanguageDetectorAsyncModule } from 'i18next';
import { Platform } from 'react-native';
import { initReactI18next } from 'react-i18next';
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

void i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    fallbackLng: 'ja',
    defaultNS: 'translation',
    resources: {
      ja: { translation: ja },
      'zh-TW': { translation: zhTW },
      en: { translation: en },
    },
    interpolation: { escapeValue: false },
  });

export async function changeLanguage(language: SupportedLanguage) {
  await i18n.changeLanguage(language);
  if (canUsePersistentStorage()) await AsyncStorage.setItem(languageStorageKey, language);
}

export default i18n;
