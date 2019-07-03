const createDimensionAwareModel = require('./dimension-aware-model');
const dimensionInterface = require('../dimension-interface');
const sanitizeOptions = require('../options');

/**
 * Api plugin
 * @param {Mongoose.Schema} schema Schema to extend
 * @param {MongoTenantOptions} [options] Options (optional)
 */
module.exports = (schema, options) => {
  const sanitizedOptions = sanitizeOptions(options || {});
  const {dimension, accessorMethod} = sanitizedOptions;

  dimensionInterface(schema).add(dimension, sanitizedOptions);

  const cache = new Map();
  Object.assign(schema.statics, {
    [accessorMethod]: function(dimensionId) {
      const cacheKey = `${this.modelName}:${dimension}:${dimensionId}`;
      if (!cache.has(cacheKey)) {
        const base = this.model(this.modelName);
        const model = createDimensionAwareModel({
          base,
          dimensionId,
          options: sanitizedOptions,
        });
        cache.set(cacheKey, model);
      }
      return cache.get(cacheKey);
    },
  });

  return this;
};
