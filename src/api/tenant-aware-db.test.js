const createTenantAwareDb = require('./tenant-aware-db');
const buildOptions = require('../options');

describe('tenant-aware-db', () => {
  describe('when called with proper parameters', () => {
    const tenantId = '23';
    const options = buildOptions();

    it('overwrites the model method', () => {
      const db = {
        model: () => {},
      };
      const result = createTenantAwareDb({db, tenantId, options});
      expect(result).toHaveProperty('model');
      expect(result.model).toBeInstanceOf(Function);
      expect(result.model).not.toBe(db.model);
    });

    it('returns a tenant aware model if compatible', () => {
      const awareModel = {
        hasTenantContext: true,
        mongoTenant: {...options},
      };
      const unawareModel = {
        [options.accessorMethod]: () => awareModel,
        mongoTenant: {...options},
      };
      const db = {
        model: () => unawareModel,
      };

      const awareDb = createTenantAwareDb({db, tenantId, options});
      const result = awareDb.model('test');

      expect(result).toBe(awareModel);
    });

    it('returns a tenant unaware model if not compatible', () => {
      const unawareModel = {
        [options.accessorMethod]: () => {
          throw new Error();
        },
        mongoTenant: {
          ...options,
          tenantIdKey: 'dimension',
        },
      };
      const db = {
        model: () => unawareModel,
      };

      const awareDb = createTenantAwareDb({db, tenantId, options});
      const result = awareDb.model('test');

      expect(result).toBe(unawareModel);
    });
  });
});
