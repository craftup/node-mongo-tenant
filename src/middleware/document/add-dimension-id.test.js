const addTenantId = require('./add-dimension-id');
const dimensionInterface = require('../../dimension-interface');

describe('add-dimension-id', () => {
  const tenantId = '23';
  const dimension = 'tenant';
  const dimensionIdKey = 'tenantId';
  const dimensionIdGetter = 'getTenantId';
  const options = {
    dimension,
    dimensionIdKey,
    dimensionIdGetter,
  };
  const middleware = addTenantId(options);

  describe('builds a document middleware', () => {
    describe('when called', () => {
      it('calls back next', () => {
        const next = jest.fn();
        middleware.call({}, next);

        expect(next).toHaveBeenCalled();
      });

      describe('on model with dimension context', () => {
        const Model = function() {};
        dimensionInterface(Model).add(dimension, options);
        Model[dimensionIdGetter] = () => tenantId;

        it('modifies the subject', () => {
          const entity = new Model();
          middleware.call(entity, () => {});

          expect(entity).toHaveProperty(dimensionIdKey, tenantId);
        });
      });

      describe('on model without dimension context', () => {
        const Model = function() {};

        it("doesn't modify the subject", () => {
          const entity = new Model();
          const snapshot = JSON.stringify(entity);

          middleware.call(entity, () => {});

          expect(JSON.stringify(entity)).toBe(snapshot);
        });
      });
    });
  });
});
