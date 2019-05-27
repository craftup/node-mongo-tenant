const addTenantId = require('./add-tenant-id');

describe('add-tenant-id', () => {
  const tenantId = '23';
  const tenantIdKey = 'tenantId';
  const tenantIdGetter = 'getTenantId';
  const options = {
    tenantIdKey: 'tenantId',
    tenantIdGetter: 'getTenantId',
  };
  const middleware = addTenantId(options);

  describe('builds a document middleware', () => {

    describe('when called', () => {
      it('calls back next', () => {
        const next = jest.fn();
        middleware.call({}, next);

        expect(next).toHaveBeenCalled();
      });

      describe('on schema with tenant context', () => {
        const Schema = function () {};
        Schema.hasTenantContext = true;
        Schema[tenantIdGetter] = () => tenantId;

        it('modifies the subject', () => {
          const entity = new Schema();
          middleware.call(entity, () => {});

          expect(entity).toHaveProperty(tenantIdKey, tenantId);
        });
      });

      describe('on schema without tenant context', () => {
        const Schema = function () {};

        it('doesn\'t modify the subject', () => {
          const entity = new Schema();
          const snapshot = JSON.stringify(entity);

          middleware.call(entity, () => {});

          expect(JSON.stringify(entity)).toBe(snapshot);
        });
      });
    });
  });
});
