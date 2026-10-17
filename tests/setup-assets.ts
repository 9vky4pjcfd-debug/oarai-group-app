import Module from 'node:module';

// Metro resolves `require('@/assets/...png')` to a numeric asset id; Node cannot, so tests get a stub.
const assetPattern = /\.(png|jpe?g|webp|gif|svg)$/i;
type Loader = (request: string, parent: unknown, isMain: boolean) => unknown;
const moduleWithLoad = Module as unknown as { _load: Loader };
const originalLoad = moduleWithLoad._load;
moduleWithLoad._load = function load(request, parent, isMain) {
  return assetPattern.test(request) ? 1 : originalLoad.call(this, request, parent, isMain);
};
