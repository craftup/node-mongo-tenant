/**
 * Check if something looks like options
 * @param {MongoTenantOptions} options
 * @returns {boolean}
 */
const isPluginOptions = options =>
  options && options.accessorMethod && options.tenantIdKey && true;
/**
 * Checks if instance is compatible to other plugin instance
 *
 * For population of referenced models it's necessary to detect if the tenant
 * plugin installed in these models is compatible to the plugin of the host
 * model. If they are compatible they are one the same "level".
 *
 * @param {MongoTenantOptions} a
 * @param {MongoTenantOptions} b
 * @returns {boolean}
 */
module.exports = (a, b) => {
  return (
    isPluginOptions(a) && isPluginOptions(b) && a.tenantIdKey === b.tenantIdKey
  );
};
