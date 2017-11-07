/**
 * mongo-tenant - Multi-tenancy for mongoose on document level.
 *
 * @copyright   Copyright (c) 2016-2017, craftup
 * @license     https://github.com/craftup/node-mongo-tenant/blob/master/LICENSE MIT
 */

'use strict';

const
  assert = require('chai').assert,
  utils = require('./_utils');

describe('MongoTenant', function() {
  describe('requireTenantId', function() {
    utils.clearDatabase();

    it('should allow a nullable tenant id by default.', function(next) {
      const TestModel = utils.createTestModel({});

      TestModel.byTenant(null).create({}, function(err, model) {
        assert(!err, 'Expected creation of 1 test entity to work.');
        assert(!model.getTenantId());

        next();
      });
    });

    it('should allow an undefined tenant id by default.', function(next) {
      const TestModel = utils.createTestModel({});

      TestModel.byTenant(undefined).create({}, function(err, model) {
        assert(!err, 'Expected creation of 1 test entity to work.');
        assert(!model.getTenantId());

        next();
      });
    });

    it('should not allow a nullable tenant id when tenant id is required.', function(next) {
      const TestModel = utils.createTestModel({}, {
        mongoTenant: {
          requireTenantId: true,
        },
      });

      TestModel.byTenant(null).create({}, function(err) {
        assert(err, 'Expected creation of 1 test entity to fail.');

        next();
      });
    });

    it('should not allow an undefined tenant id when tenant id is required.', function(next) {
      const TestModel = utils.createTestModel({}, {
        mongoTenant: {
          requireTenantId: true,
        },
      });

      TestModel.byTenant(undefined).create({}, function(err) {
        assert(err, 'Expected creation of 1 test entity no fail.');

        next();
      });
    });
  });
});
