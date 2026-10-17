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

/**
 * Links in hotel content come from the backend, so only plain https pages are opened.
 * Anything else (javascript:, data:, http:, malformed) is dropped and its button hidden.
 */
export function safeExternalUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
