const buildOptions = require('../options');
const createDimensionAwareDb = require('./dimension-aware-db');
const dimensionInterface = require('../dimension-interface');

describe('dimension-aware-db', () => {
  describe('when called with proper parameters', () => {
    const dimension = 'dim';
    const dimensionId = '23';
    const options = buildOptions({dimension});

    it('overwrites the model method', () => {
      const db = {
        model: () => {},
      };
      const result = createDimensionAwareDb({db, dimensionId, options});
      expect(result).toHaveProperty('model');
      expect(result.model).toBeInstanceOf(Function);
      expect(result.model).not.toBe(db.model);
    });

    it('returns a dimension aware model if compatible', () => {
      const awareModel = {};
      const unawareModel = {
        schema: {},
        [options.accessorMethod]: () => awareModel,
      };
      dimensionInterface(unawareModel.schema).add(dimension, options);
      const db = {
        model: () => unawareModel,
      };

      const awareDb = createDimensionAwareDb({db, dimensionId, options});
      const result = awareDb.model('test');

      expect(result).toBe(awareModel);
    });

    it('returns a dimension unaware model if not compatible', () => {
      const unawareModel = {
        schema: {},
      };
      const db = {
        model: () => unawareModel,
      };

      const awareDb = createDimensionAwareDb({db, dimensionId, options});
      const result = awareDb.model('test');

      expect(result).toBe(unawareModel);
    });
  });
});
