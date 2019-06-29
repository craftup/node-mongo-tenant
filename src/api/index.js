const buildModelCache = require('./tenant-aware-model-cache');
const createTenantAwareModel = require('./tenant-aware-model');
const sanitizeOptions = require('../options');

/**
 * Tenant api plugin
 * @param {Mongoose.Schema} schema Schema to extend
 * @param {MongoTenantOptions} [options] Options (optional)
 */
module.exports = (schema, options) => {
  const sanitizedOptions = sanitizeOptions(options || {});
  const {accessorMethod} = sanitizedOptions;
  const cache = buildModelCache();

  Object.assign(schema.statics, {
    [accessorMethod]: function(tenantId) {
      if (!cache.has(this.modelName, tenantId)) {
        const base = this.model(this.modelName);
        const model = createTenantAwareModel({
          base,
          tenantId,
          options: sanitizedOptions,
        });
        cache.set(this.modelName, tenantId, model);
      }
      return cache.get(this.modelName, tenantId);
    },
    get mongoTenant() {
      return {...sanitizedOptions};
    },
  });

  return this;
};
