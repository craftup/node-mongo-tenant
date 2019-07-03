const addDimensionIdField = require('./add-dimension-id-field');
const compoundIndexes = require('./compound-indexes');
const sanitizeOptions = require('../options');

/**
 * Schema plugin
 * @param {Mongoose.Schema} schema Schema to extend
 * @param {MongoTenantOptions} [options] Options (optional)
 */
const schema = (schema, options) => {
  const sanitizedOptions = sanitizeOptions(options || {});
  const {
    dimensionIdKey,
    dimensionIdType,
    requireDimensionId,
  } = sanitizedOptions;
  addDimensionIdField({
    schema,
    key: dimensionIdKey,
    type: dimensionIdType,
    required: requireDimensionId,
  });
  compoundIndexes({schema, dimensionIdKey});
};

module.exports = schema;
