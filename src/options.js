/**
 * @typedef MongoTenantOptions
 * @property {string} tenantIdGetter
 * @property {string} accessorMethod
 * @property {*} tenantIdType
 * @property {string} tenantIdKey
 * @property {boolean} requireTenantId
 */

/**
 * Sanitize plugin options
 * @param {object} [input]
 * @param {string} [input.tenantIdGetter=tenantId]
 * @param {string} [input.accessorMethod=byTenant]
 * @param {*} [input.tenantIdType=byTenant]
 * @param {string} [input.tenantIdKey=getTenantId]
 * @param {string} [input.requireTenantId=true]
 * @returns {MongoTenantOptions}
 */
const options = (input = {}) => ({
  tenantIdKey: input.tenantIdKey || 'tenantId',
  tenantIdType: input.tenantIdType || String,
  accessorMethod: input.accessorMethod || 'byTenant',
  tenantIdGetter: input.tenantIdGetter || 'getTenantId',
  requireTenantId: input.requireTenantId === true,
});

module.exports = options;
