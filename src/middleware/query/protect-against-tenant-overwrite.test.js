const protectAgainstTenantOverwrite = require('./protect-against-tenant-overwrite');

const buildQuery = ({
  hasTenantContext,
  tenantId,
  tenantIdKey,
  tenantIdGetter,
  tenantIdUpdateValue,
  isOverwrite = false
}) => ({
  _update: tenantIdUpdateValue
    ? { [tenantIdKey]: tenantIdUpdateValue }
    : {},
  options: {
    overwrite: isOverwrite
  },
  model: hasTenantContext
    ? {
      hasTenantContext,
      [tenantIdGetter]: () => tenantId,
    }
    : {}
});

describe('protect-against-tenant-overwrite', () => {
  describe('builds a query middleware', () => {
    const tenantId = '23';
    const tenantIdKey = 'tenantId';
    const tenantIdGetter = 'getTenantId';
    const options = {
      tenantIdKey: 'tenantId',
      tenantIdGetter: 'getTenantId',
    };
    const middleware = protectAgainstTenantOverwrite(options);

    let query;
    beforeEach(() => {
      query = buildQuery({
        hasTenantContext: true,
        tenantId,
        tenantIdKey,
        tenantIdGetter,
      });
    });

    describe('when called', () => {
      it('calls back next', () => {
        const next = jest.fn();
        middleware.call(query, next);

        expect(next).toHaveBeenCalled();
      });

      describe('on schema with tenant context', () => {
        it('leaves query untouched when tenantId is not part of change', () => {
          const query = buildQuery({hasTenantContext: false});
          const snapshot = JSON.stringify(query);
          middleware.call(query, () => {});
          expect(JSON.stringify(query)).toBe(snapshot);
        });

        it('leaves query untouched when tenantId is part of change but has same value', () => {
          const query = buildQuery({hasTenantContext: false});
          const snapshot = JSON.stringify(query);
          middleware.call(query, () => {});
          expect(JSON.stringify(query)).toBe(snapshot);
        });

        it('updates tenantId value if it is part of change with different value', () => {
          query = buildQuery({hasTenantContext: true, tenantId, tenantIdKey, tenantIdGetter, tenantIdUpdateValue: '42'});
          middleware.call(query, () => {});
          expect(query).toHaveProperty(`_update.${tenantIdKey}`, tenantId);
        });

        it('updates tenantId value if it is part of change with different value ($set)', () => {
          query = buildQuery({hasTenantContext: true, tenantId, tenantIdKey, tenantIdGetter});
          query._update.$set = { [tenantIdKey]: '42' };
          middleware.call(query, () => {});
          expect(query).toHaveProperty(`_update.$set.${tenantIdKey}`, tenantId);
        });

        it('sets tenantId value if it is missing in an overwrite', () => {
          query = buildQuery({hasTenantContext: true, tenantId, tenantIdKey, tenantIdGetter, isOverwrite: true});
          middleware.call(query, () => {});
          expect(query).toHaveProperty(`_update.${tenantIdKey}`, tenantId);
        });
      });

      describe('on schema without tenant context', () => {
        it('doesn\'t modifies the query', () => {
          const query = buildQuery({hasTenantContext: false});
          const snapshot = JSON.stringify(query);
          middleware.call(query, () => {});
          expect(JSON.stringify(query)).toBe(snapshot);
        });
      });
    });
  });
});
