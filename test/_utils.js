/**
 * mongo-tenant - Multi-tenancy for mongoose on document level.
 *
 * @copyright   Copyright (c) 2016-2017, craftup
 * @license     https://github.com/craftup/node-mongo-tenant/blob/master/LICENSE MIT
 */

'use strict';

const
  MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/mongo-tenant-test',
  mongoose = require('mongoose'),
  mochaMongoose = require('mocha-mongoose'),
  mongoTenantPlugin = require('../index.js'),
  Schema = mongoose.Schema;

let testModelUnifier = 0;

mongoose.Promise = Promise;

function createTestModel(schemaDefinition, options) {
  let schema = new Schema(schemaDefinition);

  options = Object.assign({
    applyOnSchema: void 0,
    mongoTenant: void 0,
    withPlugin: true
  }, options);

  if (typeof options.applyOnSchema === 'function') {
    options.applyOnSchema(schema);
  }

  if (options.withPlugin) {
    schema.plugin(mongoTenantPlugin, options.mongoTenant);
  }

  return mongoose.model(`mongoTenantTestModel${++testModelUnifier}`, schema);
}

function clearDatabase() {
  mochaMongoose(MONGO_URI);

  beforeEach(function(done) {
    if (mongoose.connection.db) return done();

    mongoose.connect(MONGO_URI, { useMongoClient: true }, done);
  });
}

module.exports = {
  clearDatabase: clearDatabase,
  createTestModel: createTestModel
};
