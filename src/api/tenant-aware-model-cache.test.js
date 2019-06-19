const buildTenantAwareModelCache = require('./tenant-aware-model-cache');

describe('tenant-aware-model-cache', () => {
  describe('builds a cache that', () => {
    it('returns a cached model', () => {
      const model = {};
      const cache = buildTenantAwareModelCache();

      cache.set('test', '23', model);
      const result = cache.get('test', '23');

      expect(result).toBe(model);
    });

    it('reports a stored model as cached', () => {
      const model = {};
      const cache = buildTenantAwareModelCache();

      cache.set('test', '23', model);
      const result = cache.has('test', '23');

      expect(result).toBe(true);
    });

    it('reports a unknown model as not cached', () => {
      const cache = buildTenantAwareModelCache();

      const result = cache.has('test', '23');

      expect(result).toBe(false);
    });

    it('reports a unknown tenant as not cached', () => {
      const model = {};
      const cache = buildTenantAwareModelCache();

      cache.set('test', '23', model);
      const result = cache.has('test', '42');

      expect(result).toBe(false);
    });
  });
});
