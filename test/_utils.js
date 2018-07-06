/**
 * mongo-tenant - Multi-tenancy for mongoose on document level.
 *
 * @copyright   Copyright (c) 2016-2017, craftup
 * @license     https://github.com/craftup/node-mongo-tenant/blob/master/LICENSE MIT
 */

'use strict';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/mongo-tenant-test';
const mongoose = require('mongoose');
const mochaMongoose = require('mocha-mongoose');
const mongoTenantPlugin = require('../index.js');
const Schema = mongoose.Schema;

let testModelUnifier = 0;

mongoose.Promise = Promise;

function createTestModel(schemaDefinition, options) {
  options = options || {};
  
  let schema = new Schema(schemaDefinition, options.schemaOptions);

  if (typeof options.applyOnSchema === 'function') {
    options.applyOnSchema(schema);
  }

  schema.plugin(mongoTenantPlugin, options.mongoTenant);

  return mongoose.model(`mongoTenantTestModel${++testModelUnifier}`, schema);
}

function clearDatabase() {
  mochaMongoose(MONGO_URI);

  beforeEach(function(done) {
    if (mongoose.connection.db) return done();

    if (mongoose.version[0] === '4') {
      mongoose.connect(MONGO_URI, { useMongoClient: true }, done);
    } else {
      mongoose.connect(MONGO_URI, done);
    }
  });
}

module.exports = {
  clearDatabase: clearDatabase,
  createTestModel: createTestModel
};
