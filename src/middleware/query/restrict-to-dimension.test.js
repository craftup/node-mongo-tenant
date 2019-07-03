const dimensionInterface = require('../../dimension-interface');
const restrictToDimension = require('./restrict-to-dimension');

const buildQuery = ({dimension, dimensionId, dimensionIdGetter}) => {
  const model = {};
  if (dimension) {
    model[dimensionIdGetter] = () => dimensionId;
    dimensionInterface(model).add(dimension, {dimension, dimensionIdGetter});
  }
  return {
    _conditions: {},
    model,
  };
};

describe('restrict-to-dimension', () => {
  describe('builds a query middleware', () => {
    const dimension = 'tenant';
    const dimensionId = '23';
    const dimensionIdKey = 'tenantId';
    const dimensionIdGetter = 'getTenantId';
    const options = {
      dimension,
      dimensionIdKey,
      dimensionIdGetter,
    };
    const middleware = restrictToDimension(options);

    let query;
    beforeEach(() => {
      query = buildQuery({
        dimension,
        dimensionIdGetter,
        dimensionId,
      });
    });

    describe('when called', () => {
      it('calls back next', () => {
        const next = jest.fn();
        middleware.call(query, next);

        expect(next).toHaveBeenCalled();
      });

      describe('on schema with dimension context', () => {
        it('adds the tenant id to the query conditions', () => {
          middleware.call(query, () => {});
          expect(query).toHaveProperty(
            `_conditions.${dimensionIdKey}`,
            dimensionId
          );
        });
      });

      describe('on schema without dimension context', () => {
        it("doesn't modifies the query", () => {
          const query = buildQuery({hasTenantContext: false});
          const snapshot = JSON.stringify(query);
          middleware.call(query, () => {});
          expect(JSON.stringify(query)).toBe(snapshot);
        });
      });
    });
  });
});
