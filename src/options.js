const fcToUpper = val =>
  val.length > 1
    ? val.substring(0, 1).toUpperCase() + val.substring(1)
    : val.toUpperCase();

/**
 * @typedef MongoTenantOptions
 * @property {string} dimension
 * @property {string} dimensionIdGetter
 * @property {string} accessorMethod
 * @property {*} dimensionIdType
 * @property {string} dimensionIdKey
 * @property {boolean} requireDimensionId
 */

/**
 * Sanitize plugin options
 * @param {object} [input]
 * @param {string} [input.dimension=tenant]
 * @param {string} [input.dimensionIdGetter=tenantId]
 * @param {string} [input.accessorMethod=byTenant]
 * @param {*} [input.dimensionIdType=byTenant]
 * @param {string} [input.dimensionIdKey=getTenantId]
 * @param {boolean} [input.requireDimensionId=true]
 * @param {string|function} [input.collection] Pattern or provider to determine collection name
 * @param {string} [input.tenantIdKey] Legacy key for dimensionIdGetter (deprecated)
 * @param {string} [input.tenantIdType] Legacy key for dimensionIdType (deprecated)
 * @param {string} [input.tenantIdGetter] Legacy key for dimensionIdKey (deprecated)
 * @param {boolean} [input.requireTenantId] Legacy key for requireDimensionId (deprecated)
 * @returns {MongoTenantOptions}
 */
const options = (input = {}) => {
  const dimension = input.dimension || 'tenant';
  return {
    dimension,
    dimensionIdKey:
      input.dimensionIdKey || input.tenantIdKey || `${dimension}Id`,
    dimensionIdType: input.dimensionIdType || input.tenantIdType || String,
    accessorMethod: input.accessorMethod || `by${fcToUpper(dimension)}`,
    dimensionIdGetter:
      input.dimensionIdGetter ||
      input.tenantIdGetter ||
      `get${fcToUpper(dimension)}Id`,
    requireDimensionId:
      input.requireDimensionId !== undefined
        ? input.requireDimensionId && true
        : input.requireTenantId !== undefined
        ? input.requireTenantId && true
        : true,
    collection: input.collection,
  };
};

module.exports = options;
