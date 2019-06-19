const sanitizeOptions = require('./options');

const extendSchema = require('./schema');
const injectApi = require('./api');
const installMiddleware = require('./middleware');

module.exports = function nodeMongoTenant(schema, options = {}) {
  const sanitizedOptions = sanitizeOptions(options);

  extendSchema({schema, options: sanitizedOptions});
  injectApi({schema, options: sanitizedOptions});
  installMiddleware({schema, options: sanitizedOptions});
};
