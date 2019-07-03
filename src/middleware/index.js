const buildAddDimensionId = require('./document/add-dimension-id');
const buildProtectAgainstDimensionOverwrite = require('./query/protect-against-dimension-overwrite');
const buildRestrictToDimension = require('./query/restrict-to-dimension');
const sanitizeOptions = require('../options');

/**
 * Middleware plugin
 * @param {Mongoose.Schema} schema Schema to extend
 * @param {MongoTenantOptions} [options] Options (optional)
 */
const middleware = (schema, options) => {
  const sanitizedOptions = sanitizeOptions(options || {});
  const {dimension, dimensionIdKey, dimensionIdGetter} = sanitizedOptions;

  const restrictToDimension = buildRestrictToDimension({
    dimension,
    dimensionIdKey,
    dimensionIdGetter,
  });
  [
    'count',
    'deleteMany',
    'deleteOne',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndReplace',
    'findOneAndUpdate',
    'remove',
    'replaceOne',
    'update',
    'updateOne',
    'updateMany',
  ].forEach(operation => schema.pre(operation, restrictToDimension));

  const protectedAgainstOverwrite = buildProtectAgainstDimensionOverwrite({
    dimension,
    dimensionIdKey,
    dimensionIdGetter,
  });
  [
    'findOneAndReplace',
    'findOneAndUpdate',
    'replaceOne',
    'update',
    'updateOne',
    'updateMany',
  ].forEach(operation => schema.pre(operation, protectedAgainstOverwrite));

  // First `save` pre hook fired will be the mongoose default validation plugin.
  // So if we add `dimension id  on a subsequent `save` pre hook the validation
  // will always fail (given dimension id is required but not set). So we have
  // to ensure right dimension id on validate.
  schema.pre(
    'validate',
    buildAddDimensionId({dimension, dimensionIdKey, dimensionIdGetter})
  );
};

module.exports = middleware;
