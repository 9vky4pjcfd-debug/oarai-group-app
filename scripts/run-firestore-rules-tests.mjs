import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const emulatorRoot = mkdtempSync(join(tmpdir(), 'oarai-firestore-'));

try {
  mkdirSync(emulatorRoot, { recursive: true });
  copyFileSync(join(projectRoot, 'firebase', 'firestore.rules'), join(emulatorRoot, 'firestore.rules'));
  copyFileSync(join(projectRoot, 'firebase', 'firestore.indexes.json'), join(emulatorRoot, 'firestore.indexes.json'));
  writeFileSync(join(emulatorRoot, 'firebase.json'), JSON.stringify({
    firestore: { rules: 'firestore.rules', indexes: 'firestore.indexes.json' },
    emulators: { firestore: { port: 8080 }, ui: { enabled: false } },
  }));

  const firebaseCli = join(projectRoot, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
  const result = spawnSync(process.execPath, [firebaseCli, 'emulators:exec', '--config', join(emulatorRoot, 'firebase.json'), '--project', 'demo-oarai-rules-test', '--only', 'firestore', 'npm run test:rules:only'], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(emulatorRoot, { recursive: true, force: true });
}
