const restrictToTenant = require('./restrict-to-tenant');

const buildQuery = ({hasTenantContext, tenantIdGetter, tenantId}) => ({
  _conditions: {},
  model: hasTenantContext
    ? {
      hasTenantContext,
      [tenantIdGetter]: () => tenantId,
    }
    : {}
});

describe('restrict-to-tenant', () => {
  describe('builds a query middleware', () => {
    const tenantId = '23';
    const tenantIdKey = 'tenantId';
    const tenantIdGetter = 'getTenantId';
    const options = {
      tenantIdKey: 'tenantId',
      tenantIdGetter: 'getTenantId',
    };
    const middleware = restrictToTenant(options);

    let query;
    beforeEach(() => {
      query = buildQuery({
        hasTenantContext: true,
        tenantIdGetter,
        tenantId
      });
    });

    describe('when called', () => {
      it('calls back next', () => {
        const next = jest.fn();
        middleware.call(query, next);

        expect(next).toHaveBeenCalled();
      });

      describe('on schema with tenant context', () => {
        it('adds the tenant id to the query conditions', () => {
          middleware.call(query, () => {});
          expect(query).toHaveProperty(`_conditions.${tenantIdKey}`, tenantId);
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
