// Starts the Auth, Firestore and Functions emulators and runs tests/e2e/backend-flow.mjs against them.
// The emulator config and the owner email param exist only while the run lasts.
import { spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = join(root, 'firebase.e2e.tmp.json');
const params = join(root, 'functions', '.env.local');
writeFileSync(config, JSON.stringify({
  functions: [{ source: 'functions', runtime: 'nodejs22' }],
  firestore: { rules: 'firebase/firestore.rules', indexes: 'firebase/firestore.indexes.json' },
  emulators: { auth: { port: 9099 }, firestore: { port: 8080 }, functions: { port: 5001 }, ui: { enabled: false } },
}));
writeFileSync(params, 'OWNER_EMAILS=owner@example.com\n');
try {
  const build = spawnSync('npm', ['--prefix', 'functions', 'run', 'build'], { cwd: root, stdio: 'inherit' });
  if (build.status !== 0) throw new Error('functions build failed');
  const firebase = join(root, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
  const result = spawnSync(process.execPath, [firebase, 'emulators:exec', '--config', config, '--project', 'demo-oarai', '--only', 'auth,firestore,functions', 'node tests/e2e/backend-flow.mjs'], { cwd: root, stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(config, { force: true });
  rmSync(params, { force: true });
}
