// Adds a Content-Security-Policy and a referrer policy to every page of the static web export.
// GitHub Pages cannot send response headers, so they go in <meta> tags at the top of <head>.
// Inline scripts emitted by Expo Router are allowed by their SHA-256 hash, so nothing else inline can run.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = process.argv[2] ?? 'dist';

// Firebase endpoints the app will call once the real backend is connected (Firestore, Auth, Cloud Functions).
const firebaseHosts = ['https://*.googleapis.com', 'https://*.cloudfunctions.net', 'https://*.firebaseapp.com'];

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

function policy(scriptHashes) {
  return [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(' ')}`.trim(),
    // react-native-web writes component styles into <style> tags at runtime.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${firebaseHosts.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

const files = htmlFiles(distDir);
let updated = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  if (html.includes('http-equiv="Content-Security-Policy"')) continue;
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map(([, body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy([...new Set(hashes)])}"/>`
    + '<meta name="referrer" content="strict-origin-when-cross-origin"/>';
  // The policy only covers what comes after it, so it goes right after the charset at the top of <head>.
  const anchor = /<meta charset="utf-8"\s*\/?>/i.exec(html) ?? /<head>/i.exec(html);
  if (!anchor) throw new Error(`No <head> in ${file}`);
  const at = anchor.index + anchor[0].length;
  writeFileSync(file, html.slice(0, at) + meta + html.slice(at));
  updated += 1;
}
console.log(`Added security meta tags to ${updated} of ${files.length} pages.`);
