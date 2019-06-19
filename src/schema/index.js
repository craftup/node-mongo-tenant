const addTenantIdField = require('./add-tenant-id-field');
const compoundIndexes = require('./compound-indexes');

/**
 *
 * @param {object} schema
 * @param {MongoTenantOptions} options
 */
const schema = ({schema, options}) => {
  const {tenantIdKey, tenantIdType, requireTenantId} = options;
  addTenantIdField({
    schema,
    key: tenantIdKey,
    type: tenantIdType,
    required: requireTenantId,
  });
  compoundIndexes({schema, tenantIdKey});
};

module.exports = schema;
