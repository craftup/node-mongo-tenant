const dimensionAwareModel = require('./index');
const dimensionInterface = require('../../dimension-interface');
const buildOptions = require('../../options');

describe('dimension-aware-model', () => {
  describe('when called with valid parameters', () => {
    const dimensionId = '23';
    const dimension = 'dim';
    const dimensionIdGetter = 'getDimId';
    const dimensionIdKey = 'dimId';
    const options = buildOptions({
      dimension,
      dimensionIdGetter,
      dimensionIdKey,
    });

    const buildBaseModel = () => {
      const base = class {};
      base.db = {};
      base.collection = {
        name: 'models',
        conn: {
          collection: () => ({}),
        },
      };
      return base;
    };

    let base;
    let model;
    beforeEach(() => {
      base = buildBaseModel();
      model = dimensionAwareModel({
        base,
        options,
        dimensionId,
      });
    });

    it('builds a model', () => {
      expect(model).toBeTruthy();
      expect(model).not.toBe(base);
    });

    it('builds discriminator models', () => {
      base.discriminators = {
        test: buildBaseModel(),
      };
      model = dimensionAwareModel({
        base,
        options,
        dimensionId,
      });
      expect(model).toHaveProperty('discriminators.test');
      expect(model.discriminators.test).not.toBe(base.discriminators.test);
    });

    describe('returns a model that', () => {
      const callback = () => {};

      it('keeps track of applied dimensions', () => {
        const hasDimension = dimensionInterface(model).has(dimension);
        const dimensionOptions = dimensionInterface(model).get(dimension);

        expect(hasDimension).toBe(true);
        expect(dimensionOptions).toEqual({dimensionId, ...options});
      });

      it('reports bound dimension id', () => {
        const result = model[dimensionIdGetter]();

        expect(result).toBe(dimensionId);
      });

      it('has a dimension aware db model', () => {
        expect(model.db).not.toBe(base.db);
      });

      describe('overrides static aggregate which', () => {
        beforeEach(() => {
          base.aggregate = jest.fn();
        });

        // mongoose 4.x
        it('applies dimension context to single pipeline', () => {
          model.aggregate({$project: {a: 1}});
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][0]).toEqual([
            {$match: {[dimensionIdKey]: dimensionId}},
            {$project: {a: 1}},
          ]);
        });

        // mongoose 4.x
        it('applies dimension context to multi pipeline', () => {
          model.aggregate({$project: {a: 1}}, {$skip: 5});
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][0]).toEqual([
            {$match: {[dimensionIdKey]: dimensionId}},
            {$project: {a: 1}},
            {$skip: 5},
          ]);
        });

        it('applies dimension context to pipeline list', () => {
          model.aggregate([{$project: {a: 1}}, {$skip: 5}]);
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][0]).toEqual([
            {$match: {[dimensionIdKey]: dimensionId}},
            {$project: {a: 1}},
            {$skip: 5},
          ]);
        });

        it('applies dimension context to aggregate builder', () => {
          model.aggregate();
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][0]).toEqual([
            {$match: {[dimensionIdKey]: dimensionId}},
          ]);
        });

        it('forwards given callback', () => {
          const callback = () => {};
          model.aggregate([], callback);
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][1]).toBe(callback);
        });
      });

      it('applies dimension context in deleteOne', () => {
        base.deleteOne = jest.fn();
        model.deleteOne({}, undefined);

        expect(base.deleteOne).toHaveBeenCalledWith(
          {[dimensionIdKey]: dimensionId},
          undefined
        );
      });

      it('applies dimension context in deleteMany', () => {
        base.deleteMany = jest.fn();
        model.deleteMany({}, {}, undefined);

        expect(base.deleteMany).toHaveBeenCalledWith(
          {[dimensionIdKey]: dimensionId},
          {},
          undefined
        );
      });

      describe('overrides static remove which', () => {
        it.each([
          [
            'just with conditions',
            [{foo: 'bar'}],
            [{foo: 'bar', [dimensionIdKey]: dimensionId}, undefined],
          ],
          [
            'with conditions and callback',
            [{foo: 'bar'}, callback],
            [{foo: 'bar', [dimensionIdKey]: dimensionId}, callback],
          ],
        ])(
          'applies dimension context when called %s',
          (name, args, expectedBaseArgs) => {
            base.remove = jest.fn();
            model.remove(...args);

            expect(base.remove).toHaveBeenCalledWith(...expectedBaseArgs);
          }
        );

        it.each([
          ['without any arguments', [], [undefined, undefined]],
          [
            'just with callback',
            [callback],
            [{[dimensionIdKey]: dimensionId}, callback],
          ],
        ])(
          'does not apply dimension context when called %s',
          (name, args, expectedBaseArgs) => {
            base.remove = jest.fn();
            model.remove(...args);

            expect(base.remove).toHaveBeenCalledWith(...expectedBaseArgs);
          }
        );
      });

      describe('overrides static insertMany which', () => {
        it('applies dimension context on single document', async () => {
          base.insertMany = jest.fn(() => Promise.resolve({}));
          await model.insertMany({}, undefined);

          expect(base.insertMany).toHaveBeenCalledTimes(1);
          expect(base.insertMany.mock.calls[0][0]).toEqual({
            [dimensionIdKey]: dimensionId,
          });
        });

        it('applies dimension context on multiple documents', async () => {
          base.insertMany = jest.fn(() => Promise.resolve([{}]));
          await model.insertMany([{}], undefined);

          expect(base.insertMany).toHaveBeenCalledTimes(1);
          expect(base.insertMany.mock.calls[0][0]).toEqual([
            {[dimensionIdKey]: dimensionId},
          ]);
        });

        it('builds dimension aware models for promise', async () => {
          base.insertMany = docs => Promise.resolve(docs);
          const newDocs = [{}];
          const insertedDocs = await model.insertMany(newDocs);

          expect(insertedDocs).toHaveLength(1);
          expect(insertedDocs[0]).toBeInstanceOf(model);
          // expect(insertedDocs[0].hasTenantContext).toBe(true);
          expect(insertedDocs[0][dimensionIdGetter]()).toBe(dimensionId);
        });

        it('builds dimension aware models for callback', done => {
          base.insertMany = docs => Promise.resolve(docs);
          const newDoc = {};
          model.insertMany([newDoc], (err, docs) => {
            expect(err).toBe(null);
            expect(docs).toHaveLength(1);

            const savedDoc = docs[0];
            expect(savedDoc).toBeInstanceOf(model);
            // expect(savedDoc.hasTenantContext).toBe(true);
            expect(savedDoc[dimensionIdGetter]()).toBe(dimensionId);

            done();
          });
        });

        it('forwards errors', done => {
          const expectedError = new Error('test');
          base.insertMany = () => Promise.reject(expectedError);
          model.insertMany([], (err, docs) => {
            expect(err).toBe(expectedError);
            expect(docs).toBe(undefined);
            done();
          });
        });
      });

      describe('when instantiated', () => {
        let instance;
        beforeEach(() => {
          instance = new model();
        });

        // it('reports having a dimension context', () => {
        //   const result = instance.hasTenantContext;
        //
        //   expect(result).toBe(true);
        // });

        it('reports bound dimension id', () => {
          const result = instance[dimensionIdGetter]();

          expect(result).toBe(dimensionId);
        });
      });
    });
  });
});
