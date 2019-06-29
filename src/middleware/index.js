const buildAddTenantId = require('./document/add-tenant-id');
const buildProtectAgainstTenantOverwrite = require('./query/protect-against-tenant-overwrite');
const buildRestrictToTenant = require('./query/restrict-to-tenant');
const sanitizeOptions = require('../options');

/**
 * Tenant middleware plugin
 * @param {Mongoose.Schema} schema Schema to extend
 * @param {MongoTenantOptions} [options] Options (optional)
 */
const middleware = (schema, options) => {
  const sanitizedOptions = sanitizeOptions(options || {});
  const {tenantIdKey, tenantIdGetter} = sanitizedOptions;

  const restrictToTenant = buildRestrictToTenant({tenantIdKey, tenantIdGetter});
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
  ].forEach(operation => schema.pre(operation, restrictToTenant));

  const protectedAgainstOverwrite = buildProtectAgainstTenantOverwrite({
    tenantIdKey,
    tenantIdGetter,
  });
  [
    'findOneAndReplace',
    'findOneAndUpdate',
    'replaceOne',
    'update',
    'updateOne',
    'updateMany',
  ].forEach(operation => schema.pre(operation, protectedAgainstOverwrite));

  schema.pre('save', buildAddTenantId({tenantIdKey, tenantIdGetter}));
};

module.exports = middleware;
