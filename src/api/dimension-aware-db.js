const arePluginsCompatible = require('./are-plugins-compatible');
const dimensionInterface = require('../dimension-interface');

/**
 * Create db connection bound to a specific dimension
 *
 * @param {Connection} db
 * @param {*} dimensionId
 * @param {MongoTenantOptions} options
 * @returns {Connection}
 */
module.exports = ({db, dimensionId, options}) => {
  const awareDb = Object.create(db);
  awareDb.model = name => {
    const unawareModel = db.model(name);
    const otherPluginOptions = dimensionInterface(unawareModel.schema).get(
      options.dimension
    );

    if (!arePluginsCompatible(options, otherPluginOptions)) {
      return unawareModel;
    }

    return unawareModel[otherPluginOptions.accessorMethod](dimensionId);
  };
  return awareDb;
};
