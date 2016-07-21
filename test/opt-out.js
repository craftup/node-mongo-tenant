'use strict';

const
  assert = require('chai').assert,
  utils = require('./_utils');

describe('MongoTenant', function() {
  describe('#Opt-Out', function() {
    it('accessor method should deliver default mongoose model when mongoTenant is disabled.', function() {
      let Model = utils.createTestModel({}, {
        mongoTenant: {
          enabled: false
        }
      });

      assert(typeof Model.byTenant === 'function', 'Expected accessor method to be available.');
      assert(typeof Model.byTenant(1).getTenantId === 'undefined', 'Expected default mongoose model when mongoTenant is disabled.');
    });
  });
});