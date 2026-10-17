import { describe, expect, it } from 'vitest';
import { safeExternalUrl } from '@/features/hotel/content-utils';

describe('safeExternalUrl', () => {
  it('keeps https links', () => {
    expect(safeExternalUrl('https://www.roman-kan.jp/rooms/')).toBe('https://www.roman-kan.jp/rooms/');
    expect(safeExternalUrl(' https://doggyscoast-oarai.jp/room.html ')).toBe('https://doggyscoast-oarai.jp/room.html');
  });

  it('drops links that could run script, leave https or hide credentials', () => {
    for (const value of ['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'http://example.com/', 'file:///etc/passwd', 'https://user:pass@example.com/', '//example.com/', 'not a url', '', undefined]) {
      expect(safeExternalUrl(value)).toBeNull();
    }
  });
});
