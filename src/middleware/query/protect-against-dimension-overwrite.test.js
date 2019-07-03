const dimensionInterface = require('../../dimension-interface');
const protectAgainstDimensionOverwrite = require('./protect-against-dimension-overwrite');

const buildQuery = ({
  dimension,
  dimensionId,
  dimensionIdKey,
  dimensionIdGetter,
  dimensionIdUpdateValue,
  isOverwrite = false,
}) => {
  const model = {};
  if (dimension) {
    dimensionInterface(model).add(dimension, {
      dimension,
      dimensionIdKey,
      dimensionIdGetter,
    });
    model[dimensionIdGetter] = () => dimensionId;
  }

  return {
    _update: dimensionIdUpdateValue
      ? {[dimensionIdKey]: dimensionIdUpdateValue}
      : {},
    options: {
      overwrite: isOverwrite,
    },
    model,
  };
};

describe('protect-against-dimension-overwrite', () => {
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
    const middleware = protectAgainstDimensionOverwrite(options);

    let query;
    beforeEach(() => {
      query = buildQuery({
        dimension: 'tenant',
        dimensionId,
        dimensionIdKey,
        dimensionIdGetter,
      });
    });

    describe('when called', () => {
      it('calls back next', () => {
        const next = jest.fn();
        middleware.call(query, next);

        expect(next).toHaveBeenCalled();
      });

      describe('on schema with dimension context', () => {
        it('leaves query untouched when dimensionId is not part of change', () => {
          const query = buildQuery({hasTenantContext: false});
          const snapshot = JSON.stringify(query);
          middleware.call(query, () => {});
          expect(JSON.stringify(query)).toBe(snapshot);
        });

        it('leaves query untouched when dimensionId is part of change but has same value', () => {
          const query = buildQuery({hasTenantContext: false});
          const snapshot = JSON.stringify(query);
          middleware.call(query, () => {});
          expect(JSON.stringify(query)).toBe(snapshot);
        });

        it('updates dimensionId value if it is part of change with different value', () => {
          query = buildQuery({
            dimension: 'tenant',
            dimensionId,
            dimensionIdKey,
            dimensionIdGetter,
            dimensionIdUpdateValue: '42',
          });
          middleware.call(query, () => {});
          expect(query).toHaveProperty(
            `_update.${dimensionIdKey}`,
            dimensionId
          );
        });

        it('updates dimensionId value if it is part of change with different value ($set)', () => {
          query = buildQuery({
            dimension: 'tenant',
            dimensionId,
            dimensionIdKey,
            dimensionIdGetter,
          });
          query._update.$set = {[dimensionIdKey]: '42'};
          middleware.call(query, () => {});
          expect(query).toHaveProperty(
            `_update.$set.${dimensionIdKey}`,
            dimensionId
          );
        });

        it('sets dimensionId value if it is missing in an overwrite', () => {
          query = buildQuery({
            dimension: 'tenant',
            dimensionId,
            dimensionIdKey,
            dimensionIdGetter,
            isOverwrite: true,
          });
          middleware.call(query, () => {});
          expect(query).toHaveProperty(
            `_update.${dimensionIdKey}`,
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
