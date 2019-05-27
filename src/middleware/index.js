const buildAddTenantId = require('./document/add-tenant-id');
const buildProtectAgainstTenantOverwrite = require('./query/protect-against-tenant-overwrite')
const buildRestrictToTenant = require('./query/restrict-to-tenant');

/**
 *
 * @param {object} schema
 * @param {MongoTenantOptions} options
 */
const middleware = ({schema, options}) => {
  const {tenantIdKey, tenantIdGetter} = options;

  const restrictToTenant = buildRestrictToTenant({tenantIdKey, tenantIdGetter});
  [
    'count',
    'deleteMany',
    'deleteOne',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndUpdate',
    'remove',
    'update',
    'updateOne',
    'updateMany',
  ].forEach((operation) => schema.pre(operation, restrictToTenant));

  const protectedAgainstOverwrite = buildProtectAgainstTenantOverwrite({tenantIdKey, tenantIdGetter});
  [
    'findOneAndUpdate',
    'update',
  ].forEach((operation) => schema.pre(operation, protectedAgainstOverwrite));

  schema.pre('save', buildAddTenantId({tenantIdKey, tenantIdGetter}));
};

module.exports = middleware;
