'use strict';

const
  assert = require('chai').assert,
  utils = require('./_utils');

describe('MongoTenant', function() {
  describe('#Integration', function() {
    it('should inject default accessor method.', function() {
      let Model = utils.createTestModel({});

      assert(typeof Model.byTenant === 'function', 'Expected default accessor method to be statically available.');
    });

    it('should inject custom accessor method.', function() {
      let Model = utils.createTestModel({}, {
        mongoTenant: {
          accessorMethod: 'by_tenant'
        }
      });

      assert(typeof Model.by_tenant === 'function', 'Expected custom accessor method `by_tenant` to be statically available.');
    });

    it('should expose its tenant binding.', function() {
      let
        Model = utils.createTestModel({}),
        ModelBoundToTenant = Model.byTenant(1);

      assert(ModelBoundToTenant.hasTenantContext === true, 'Expected static flag `hasTenantContext` on models bound to a certain tenant.');
      assert((new ModelBoundToTenant()).hasTenantContext === true, 'Expected property `hasTenantContext` on model instances bound to a certain tenant.');
      assert(typeof Model.hasTenantContext === 'undefined', 'Expected the mongoose model to be untouched.');
      assert(typeof (new Model()).hasTenantContext === 'undefined', 'Expected the mongoose model to be untouched.');
    });

    it('should bind the model to the proper tenant.', function() {
      let
        Model = utils.createTestModel({}),
        modelA, modelB;

      modelA = Model.byTenant(1);
      modelB = Model.byTenant(2);

      assert.equal(modelA.getTenantId(), 1, 'Expected the tenantId of tenant specific model to be `1`.');
      assert.equal((new modelA()).getTenantId(), 1, 'Expected the tenantId of tenant specific model to be `1`.');
      assert.equal(modelB.getTenantId(), 2, 'Expected the tenantId of tenant specific model to be `2`.');
      assert.equal((new modelB()).getTenantId(), 2, 'Expected the tenantId of tenant specific model to be `2`.');
    });

    it('should create tenant specific models only once and cache previous compilations.', function() {
      let
        Model = utils.createTestModel({}),
        modelA, modelB;

      assert.equal(
        Model.byTenant(1), Model.byTenant(1),
        'Expected multiple calls to tenant specific model accessor to deliver same model compilation.'
      );
    });
  });
});