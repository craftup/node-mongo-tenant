const createTenantAwareDb = require('../tenant-aware-db');
const parseAggregateArguments = require('./parse-aggregate-arguments');
const modifyBulkWriteOpertations = require('./modify-bulk-write-operations');

const createPlainModel = ({base, db, tenantId, tenantIdGetter, tenantIdKey}) =>
  class extends base {
    static get hasTenantContext() {
      return true;
    }

    static [tenantIdGetter]() {
      return tenantId;
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
          [tenantIdKey]: this[tenantIdGetter](),
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
      conditions[tenantIdKey] = this[tenantIdGetter]();

      return super.deleteOne(conditions, callback);
    }

    static deleteMany(conditions, options, callback) {
      conditions[tenantIdKey] = this[tenantIdGetter]();

      return super.deleteMany(conditions, options, callback);
    }

    static remove(conditions, callback) {
      if (arguments.length === 1 && typeof conditions === 'function') {
        callback = conditions;
        conditions = {};
      }

      if (conditions) {
        conditions[tenantIdKey] = this[tenantIdGetter]();
      }

      return super.remove(conditions, callback);
    }

    static insertMany(docs, callback) {
      const self = this;
      const tenantId = this[tenantIdGetter]();

      // Model.insertMany supports a single document as parameter
      if (!Array.isArray(docs)) {
        docs[tenantIdKey] = tenantId;
      } else {
        docs.forEach(doc => {
          doc[tenantIdKey] = tenantId;
        });
      }

      // ensure the returned docs are instanced of the bound multi tenant model
      return super.insertMany(docs, (err, docs) => {
        if (err) {
          return callback && callback(err);
        }

        return callback && callback(null, docs.map(doc => new self(doc)));
      });
    }

    static bulkWrite(ops, options, callback) {
      const tenantId = this[tenantIdGetter]();
      const modifiedOps = modifyBulkWriteOpertations({
        ops,
        tenantId,
        tenantIdKey,
      });

      return super.bulkWrite(modifiedOps, options, callback);
    }

    static get db() {
      return db;
    }

    get hasTenantContext() {
      return true;
    }

    [tenantIdGetter]() {
      return tenantId;
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

const createModel = ({
  base,
  db,
  tenantId,
  tenantIdGetter,
  tenantIdKey,
  createModel,
}) => {
  const model = createPlainModel({
    base,
    db,
    tenantId,
    tenantIdGetter,
    tenantIdKey,
  });

  inheritOtherStatics({model, base});
  createDiscriminatorModels({model, base, createModel});

  return model;
};

module.exports = ({base, options, tenantId}) => {
  const {tenantIdGetter, tenantIdKey} = options;
  const db = createTenantAwareDb({
    db: base.db,
    tenantId,
    options,
  });

  const config = {
    db,
    tenantId,
    tenantIdGetter,
    tenantIdKey,
  };
  const create = base =>
    createModel({
      base,
      ...config,
    });
  config.createModel = create;

  return create(base);
};
