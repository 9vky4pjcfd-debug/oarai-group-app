// Bundles the functions with the app's shared rules (booking, membership) and seed content,
// so the server enforces exactly the rules the app shows. Firebase packages stay external.
import { build } from 'esbuild';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const functionsDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(functionsDir, '..');

// `require('@/assets/content/room.jpg')` becomes the string 'content/room.jpg' (see src/seed.ts).
const assetKeys = {
  name: 'asset-keys',
  setup(builder) {
    builder.onResolve({ filter: /^@\/assets\// }, (args) => ({ path: args.path.slice('@/assets/'.length), namespace: 'asset-key' }));
    builder.onLoad({ filter: /.*/, namespace: 'asset-key' }, (args) => ({ contents: `module.exports = ${JSON.stringify(args.path)};`, loader: 'js' }));
  },
};

await build({
  entryPoints: [join(functionsDir, 'src', 'index.ts')],
  outfile: join(functionsDir, 'lib', 'index.js'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  sourcemap: true,
  external: ['firebase-admin', 'firebase-admin/*', 'firebase-functions', 'firebase-functions/*'],
  alias: { '@': appRoot },
  plugins: [assetKeys],
  logLevel: 'info',
});
console.log(`Built ${relative(appRoot, join(functionsDir, 'lib', 'index.js'))}`);
