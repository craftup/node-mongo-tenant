const arePluginsCompatible = require('./are-plugins-compatible');

/**
 * Create db connection bound to a specific tenant
 *
 * @param {Connection} db
 * @param {*} tenantId
 * @param {MongoTenantOptions} options
 * @returns {Connection}
 */
module.exports = ({db, tenantId, options}) => {
  const awareDb = Object.create(db);
  awareDb.model = name => {
    const unawareModel = db.model(name);
    /** @type MongoTenantOptions */
    const otherPluginOptions = unawareModel.mongoTenant;

    if (!arePluginsCompatible(options, otherPluginOptions)) {
      return unawareModel;
    }

    return unawareModel[otherPluginOptions.accessorMethod](tenantId);
  };
  return awareDb;
};
