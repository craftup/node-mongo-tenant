const buildModelCache = require('./tenant-aware-model-cache');
const createTenantAwareModel = require('./tenant-aware-model');

/**
 * @param schema
 * @param {MongoTenantOptions} options
 */
module.exports = ({schema, options}) => {
  const {accessorMethod} = options;
  const cache = buildModelCache();

  Object.assign(schema.statics, {
    [accessorMethod]: function(tenantId) {
      if (!cache.has(this.modelName, tenantId)) {
        const base = this.model(this.modelName);
        const model = createTenantAwareModel({
          base,
          tenantId,
          options,
        });
        cache.set(this.modelName, tenantId, model);
      }
      return cache.get(this.modelName, tenantId);
    },
    get mongoTenant() {
      return {...options};
    },
  });

  return this;
};
