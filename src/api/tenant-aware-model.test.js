const tenantAwareModel = require('./tenant-aware-model');
const options = require('../options');

describe('tenant-aware-model', () => {

  describe('when called with valid parameters', () => {
    const tenantId = '23';
    const tenantIdGetter = 'getTenantId';
    const tenantIdKey = 'tenantId';

    const buildBaseModel = () => {
      const base = class {};
      base.db = {};
      return base;
    };

    let base;
    let model;
    beforeEach(() => {
      base = buildBaseModel();
      model = tenantAwareModel({base, tenantId, tenantIdGetter, tenantIdKey});
    });

    it('builds a model', () => {
      expect(model).toBeTruthy();
      expect(model).not.toBe(base);
    });

    it('builds discriminator models', () => {
      base.discriminators = {
        'test': class {},
      };
      model = tenantAwareModel({base, tenantId, tenantIdGetter, tenantIdKey});
      expect(model).toHaveProperty('discriminators.test');
      expect(model.discriminators.test).not.toBe(base.discriminators.test);
    });

    describe('returns a model that', () => {
      const callback = () => {};

      it('reports having a tenant context', () => {
        const result = model.hasTenantContext;

        expect(result).toBe(true);
      });

      it('reports bound tenant id', () => {
        const result = model[tenantIdGetter]();

        expect(result).toBe(tenantId);
      });

      it('has a tenant aware db model', () => {
        expect(model.db).not.toBe(base.db);
      });

      describe('overrides static aggregate which', () => {
        beforeEach(() => {
          base.aggregate = jest.fn();
        });

        // mongoose 4.x
        it('applies tenant context to single pipeline', () => {
          model.aggregate({$project: {a: 1}});
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][0]).toEqual([
            {$match: {[tenantIdKey]: tenantId}},
            {$project: {a: 1}},
          ]);
        });

        // mongoose 4.x
        it('applies tenant context to multi pipeline', () => {
          model.aggregate({$project: {a: 1}}, {$skip: 5});
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][0]).toEqual([
            {$match: {[tenantIdKey]: tenantId}},
            {$project: {a: 1}},
            {$skip: 5},
          ]);
        });

        it('applies tenant context to pipeline list', () => {
          model.aggregate([{$project: {a: 1}}, {$skip: 5}]);
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][0]).toEqual([
            {$match: {[tenantIdKey]: tenantId}},
            {$project: {a: 1}},
            {$skip: 5},
          ]);
        });

        it('applies tenant context to aggregate builder', () => {
          model.aggregate();
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][0]).toEqual([
            {$match: {[tenantIdKey]: tenantId}}
          ]);
        });

        it('forwards given callback', () => {
          const callback = () => {};
          model.aggregate([], callback);
          expect(base.aggregate).toHaveBeenCalled();
          expect(base.aggregate.mock.calls[0][1]).toBe(callback);
        });
      });

      it('applies tenant context in deleteOne', () => {
        base.deleteOne = jest.fn();
        model.deleteOne({}, undefined);

        expect(base.deleteOne).toHaveBeenCalledWith(
          {[tenantIdKey]: tenantId},
          undefined
        );
      });

      it('applies tenant context in deleteMany', () => {
        base.deleteMany = jest.fn();
        model.deleteMany({}, {}, undefined);

        expect(base.deleteMany).toHaveBeenCalledWith(
          {[tenantIdKey]: tenantId},
          {},
          undefined
        );
      });

      describe('overrides static remove which', () => {
        it.each([
          ['just with conditions', [{foo: 'bar'}], [{foo: 'bar', [tenantIdKey]: tenantId}, undefined]],
          ['with conditions and callback', [{foo: 'bar'}, callback], [{foo: 'bar', [tenantIdKey]: tenantId}, callback]],
        ])('applies tenant context when called %s', (name, args, expectedBaseArgs) => {
          base.remove = jest.fn();
          model.remove(...args);

          expect(base.remove).toHaveBeenCalledWith(...expectedBaseArgs);
        });

        it.each([
          ['without any arguments', [], [undefined, undefined]],
          ['just with callback', [callback], [{[tenantIdKey]: tenantId}, callback]],
        ])('does not apply tenant context when called %s', (name, args, expectedBaseArgs) => {
          base.remove = jest.fn();
          model.remove(...args);

          expect(base.remove).toHaveBeenCalledWith(...expectedBaseArgs);
        });
      });

      describe('overrides static insertMany which', () => {
        it('applies tenant context on single document', () => {
          base.insertMany = jest.fn();
          model.insertMany({}, undefined);

          expect(base.insertMany).toHaveBeenCalledTimes(1);
          expect(base.insertMany.mock.calls[0][0]).toEqual({[tenantIdKey]: tenantId});
        });

        it('applies tenant context on multiple documents', () => {
          base.insertMany = jest.fn();
          model.insertMany([{}], undefined);

          expect(base.insertMany).toHaveBeenCalledTimes(1);
          expect(base.insertMany.mock.calls[0][0]).toEqual([{[tenantIdKey]: tenantId}]);
        });

        it('builds tenant aware models for callback', done => {
          base.insertMany = (docs, callback) => {
            callback(null, docs);
          };
          const newDoc = new model();
          model.insertMany([newDoc], (err, docs) => {
            expect(err).toBe(null);
            expect(docs).toHaveLength(1);

            const savedDoc = docs[0];
            expect(savedDoc).toBeInstanceOf(model);
            expect(savedDoc.hasTenantContext).toBe(true);
            expect(savedDoc[tenantIdGetter]()).toBe(tenantId);

            done();
          });
        });

        it('forwards errors', (done) => {
          const expectedError = new Error('test');
          base.insertMany = (docs, callback) => {
            callback(expectedError);
          };
          model.insertMany([], (err, docs) => {
            expect(err).toBe(expectedError);
            expect(docs).toBe(undefined);
            done();
          });
        });
      });

      describe('when instanciated', () => {
        let instance;
        beforeEach(() => {
          instance = new model();
        });

        it('reports having a tenant context', () => {
          const result = instance.hasTenantContext;

          expect(result).toBe(true);
        });

        it('reports bound tenant id', () => {
          const result = instance[tenantIdGetter]();

          expect(result).toBe(tenantId);
        });
      });
    });
  });
});
