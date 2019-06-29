const addTenantIdField = require('./add-tenant-id-field');
const compoundIndexes = require('./compound-indexes');
const sanitizeOptions = require('../options');

/**
 * Tenant middleware plugin
 * @param {Mongoose.Schema} schema Schema to extend
 * @param {MongoTenantOptions} [options] Options (optional)
 */
const schema = (schema, options) => {
  const sanitizedOptions = sanitizeOptions(options || {});
  const {tenantIdKey, tenantIdType, requireTenantId} = sanitizedOptions;
  addTenantIdField({
    schema,
    key: tenantIdKey,
    type: tenantIdType,
    required: requireTenantId,
  });
  compoundIndexes({schema, tenantIdKey});
};

module.exports = schema;
