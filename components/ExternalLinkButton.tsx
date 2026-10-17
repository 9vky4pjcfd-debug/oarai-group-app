import { openBrowserAsync } from 'expo-web-browser';
import { Button } from '@/components/design-system';
import { safeExternalUrl } from '@/features/hotel/content-utils';

/** Opens a link from hotel content in the in-app browser; renders nothing unless it is a plain https URL. */
export function ExternalLinkButton({ label, url }: { label: string; url: string | undefined }) {
  const safeUrl = safeExternalUrl(url);
  return safeUrl ? <Button label={label} variant="secondary" onPress={() => void openBrowserAsync(safeUrl)} /> : null;
}
