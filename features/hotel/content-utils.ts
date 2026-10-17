import type { ImageSource } from 'expo-image';
import type { ContentImage, ContentLanguage, LocalizedText } from '@/types';

export function getLocalizedText(value: LocalizedText | undefined, language: string): string {
  if (!value) return '';
  const normalized: ContentLanguage = language.toLowerCase().startsWith('zh')
    ? 'zh-TW'
    : language.toLowerCase().startsWith('en')
      ? 'en'
      : 'ja';
  return value[normalized] || value.ja || Object.values(value).find(Boolean) || '';
}

export function resolveContentImage(image: ContentImage): ImageSource | number {
  return image.kind === 'local' ? image.source : { uri: image.uri };
}

export function getImageAccessibilityLabel(image: ContentImage, language: string): string {
  return getLocalizedText(image.accessibilityLabel, language);
}
