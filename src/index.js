const extendSchema = require('./schema');
const injectApi = require('./api');
const installMiddleware = require('./middleware');

/**
 * Tenant plugin
 * @param {Mongoose.Schema} schema
 * @param {MongoTenantOptions} options
 */
module.exports = function nodeMongoTenant(schema, options = {}) {
  extendSchema(schema, options);
  injectApi(schema, options);
  installMiddleware(schema, options);
};
