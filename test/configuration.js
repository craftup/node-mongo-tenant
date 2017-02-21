/**
 * mongo-tenant - Multi-tenancy for mongoose on document level.
 *
 * @copyright   Copyright (c) 2016-2017, craftup
 * @license     https://github.com/craftup/node-mongo-tenant/blob/master/LICENSE MIT
 */

'use strict';

const
  assert = require('chai').assert,
  mongoTenantPlugin = require('../index.js');

describe('MongoTenant', function() {
  describe('#Configuration', function() {
    it('plugin should be enabled by default.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant();

      assert(mongoTenant.isEnabled() === true, 'Expected mongoTenant plugin to be enabled by default.');
    });

    it('plugin should be capable of being disabled.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant(null, {
        enabled: false
      });

      assert(mongoTenant.isEnabled() === false, 'Expected mongoTenant plugin to be disabled.');
    });

    it('should have a default tenant id key of `tenantId`.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant();

      assert.equal(mongoTenant.getTenantIdKey(), 'tenantId', 'Expected tenant id key to be `tenantId`.');
    });

    it('should be capable of setting a custom tenant id key.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant(null, {
        tenantIdKey: 'tenant_id'
      });

      assert.equal(mongoTenant.getTenantIdKey(), 'tenant_id', 'Expected tenant id key to be `tenant_id`.');
    });

    it('should have a default tenant id field type of `String`.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant();

      assert.equal(mongoTenant.getTenantIdType(), String, 'Expected tenant id field type to be `String`.');
    });

    it('should be capable of setting a custom tenant id field type.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant(null, {
        tenantIdType: Number
      });

      assert.equal(mongoTenant.getTenantIdType(), Number, 'Expected tenant id field type to be `Number`.');
    });

    it('should have a default accessor method name of `byTenant`.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant();

      assert.equal(mongoTenant.getAccessorMethod(), 'byTenant', 'Expected accessor method name to be `byTenant`.');
    });

    it('should be capable of setting a custom accessor method name.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant(null, {
        accessorMethod: 'tenancy'
      });

      assert.equal(mongoTenant.getAccessorMethod(), 'tenancy', 'Expected accessor method name to be `tenancy`.');
    });

    it('should have a default tenant id getter method name of `getTenantId`.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant();

      assert.equal(mongoTenant.getTenantIdGetter(), 'getTenantId', 'Expected tenant id getter method name to be `getTenantId`.');
    });

    it('should be capable of setting a custom tenant id getter method name.', function() {
      let mongoTenant = new mongoTenantPlugin.MongoTenant(null, {
        tenantIdGetter: 'get_tenant_id'
      });

      assert.equal(mongoTenant.getTenantIdGetter(), 'get_tenant_id', 'Expected tenant id getter method name to be `get_tenant_id`.');
    });
  });
});
