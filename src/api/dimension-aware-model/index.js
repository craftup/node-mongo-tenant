const createDimensionAwareDb = require('../dimension-aware-db');
const dimensionInterface = require('../../dimension-interface');
const modifyBulkWriteOpertations = require('./modify-bulk-write-operations');
const parseAggregateArguments = require('./parse-aggregate-arguments');
const symbolDimensions = require('../../symbol-dimensions');

const createPlainModel = ({
  base,
  db,
  dimension,
  dimensionId,
  dimensionIdGetter,
  dimensionIdKey,
}) =>
  class extends base {
    static [dimensionIdGetter]() {
      return dimensionId;
    }

    /**
     * @see Mongoose.Model.aggregate
     * @param {...Object|Array} [operations] aggregation pipeline operator(s) or operator array
     * @param {Function} [callback]
     * @return {Mongoose.Aggregate|Promise}
     */
    static aggregate() {
      const {pipeline, callback} = parseAggregateArguments(arguments);

      pipeline.unshift({
        $match: {
          [dimensionIdKey]: this[dimensionIdGetter](),
        },
      });

      // due to 4.x overloading of aggregate it's necessary to be very careful
      // what to pass as arguments so we pass callback only if its not empty
      return super.aggregate.apply(
        this,
        callback ? [pipeline, callback] : [pipeline]
      );
    }

    static deleteOne(conditions, callback) {
      conditions[dimensionIdKey] = this[dimensionIdGetter]();

      return super.deleteOne(conditions, callback);
    }

    static deleteMany(conditions, options, callback) {
      conditions[dimensionIdKey] = this[dimensionIdGetter]();

      return super.deleteMany(conditions, options, callback);
    }

    static remove(conditions, callback) {
      if (arguments.length === 1 && typeof conditions === 'function') {
        callback = conditions;
        conditions = {};
      }

      if (conditions) {
        conditions[dimensionIdKey] = this[dimensionIdGetter]();
      }

      return super.remove(conditions, callback);
    }

    static insertMany(docs, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }

      const self = this;
      const dimensionId = this[dimensionIdGetter]();

      // Model.insertMany supports a single document as parameter
      if (!Array.isArray(docs)) {
        docs[dimensionIdKey] = dimensionId;
      } else {
        docs.forEach(doc => {
          doc[dimensionIdKey] = dimensionId;
        });
      }

      const promisedResult = options
        ? super.insertMany(docs, options)
        : super.insertMany(docs);
      // ensure the returned docs are instanced of the bound multi dimension model
      const promisedMapped = promisedResult.then(result =>
        Array.isArray(result)
          ? result.map(doc => new self(doc))
          : new self(result)
      );

      if (!callback) {
        return promisedMapped;
      }

      promisedMapped.then(
        result => callback(null, result),
        err => callback(err)
      );
    }

    static bulkWrite(ops, options, callback) {
      const dimensionId = this[dimensionIdGetter]();
      const modifiedOps = modifyBulkWriteOpertations({
        ops,
        dimensionId,
        dimensionIdKey,
      });

      return super.bulkWrite(modifiedOps, options, callback);
    }

    static get db() {
      return db;
    }

    constructor(doc, fields, skipId) {
      super(doc, fields, skipId);
      this[symbolDimensions] = this.constructor[symbolDimensions];
    }

    [dimensionIdGetter]() {
      return dimensionId;
    }
  };

const inheritOtherStatics = ({model, base}) => {
  Object.getOwnPropertyNames(base)
    .filter(
      staticProperty =>
        !model.hasOwnProperty(staticProperty) &&
        !['arguments', 'caller'].includes(staticProperty)
    )
    .forEach(staticProperty => {
      const descriptor = Object.getOwnPropertyDescriptor(base, staticProperty);
      Object.defineProperty(model, staticProperty, descriptor);
    });
};

const createDiscriminatorModels = ({model, base, createModel}) => {
  if (!base.discriminators) {
    return;
  }

  model.discriminators = Object.entries(base.discriminators).reduce(
    (discriminators, [key, discriminatorModel]) => {
      discriminators[key] = createModel(discriminatorModel);
      return discriminators;
    },
    {}
  );
};

/**
 *
 * @param {Mongoose.Model} base
 * @param {Mongoose.Db} db
 * @param {*} dimensionId
 * @param {MongoTenantOptions} options
 * @param createModel
 * @returns {Mongoose.Model}
 */
const createModel = ({base, db, dimensionId, options, createModel}) => {
  const {dimension, dimensionIdGetter, dimensionIdKey} = options;

  const model = createPlainModel({
    base,
    db,
    dimension,
    dimensionId,
    dimensionIdGetter,
    dimensionIdKey,
  });

  dimensionInterface(model).add(dimension, {...options, dimensionId});
  inheritOtherStatics({model, base});
  createDiscriminatorModels({model, base, createModel});

  return model;
};

module.exports = ({base, options, dimensionId}) => {
  const db = createDimensionAwareDb({
    db: base.db,
    dimensionId,
    options,
  });

  const config = {
    db,
    dimensionId,
    options,
  };
  const create = base =>
    createModel({
      base,
      ...config,
    });
  config.createModel = create;

  return create(base);
};
