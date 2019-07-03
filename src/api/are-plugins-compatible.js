/**
 * Check if something looks like options
 * @param {MongoTenantOptions} options
 * @returns {boolean}
 */
const isPluginOptions = options =>
  (options &&
    options.dimension &&
    options.accessorMethod &&
    options.dimensionIdKey &&
    true) ||
  false;
/**
 * Checks if instance is compatible to other plugin instance
 *
 * For population of referenced models it's necessary to detect if the tenant
 * plugin installed in these models is compatible to the plugin of the host
 * model. This is done by comparing the dimension key.
 *
 * @param {MongoTenantOptions} a
 * @param {MongoTenantOptions} b
 * @returns {boolean}
 */
module.exports = (a, b) => {
  return (
    isPluginOptions(a) && isPluginOptions(b) && a.dimension === b.dimension
  );
};
