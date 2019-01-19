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
  describe('#Integration', function() {
    utils.clearDatabase();

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

    it('should bind Model.remove() to correct tenant context.', function(done) {
      let TestModel = utils.createTestModel({});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2'}, (err) => {
        assert(!err, 'Expected creation of 2 test entities to work.');

        TestModel.byTenant('tenant1').remove((err) => {
          assert(!err, 'Expected Model.remove() to work.');

          TestModel.find({}, (err, entities) => {
            assert(!err, 'Expected Model.find() to work.');
            assert.equal(entities.length, 1, 'Expected to find only one entity.');
            assert.equal(entities[0].tenantId, 'tenant2', 'Expected tenant2 scope on entity.');

            done();
          });
        });
      });
    });

    it('should bind Model.aggregate(obj..., cb) to correct tenant context.', function(done) {
      let TestModel = utils.createTestModel({num: Number});

      TestModel.create({tenantId: 'tenant1', num: 10}, {tenantId: 'tenant1', num: 12}, {tenantId: 'tenant2', num: 20}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant('tenant1').aggregate({
          $group: {
            _id: '$tenantId',
            sum: {$sum: '$num'}
          }},
          (err, results) => {
            assert(!err, 'Expected Model.aggregate() to work.');
            assert.equal(results.length, 1, 'Expected model aggregation to return exactly one result.');
            assert.equal(results[0].sum, 22, 'Expected the sum up `num` field for `tenant1` to be 22.');
            assert.equal(results[0]._id, 'tenant1', 'Expected the tenant id of aggregated data ser to be `tenant1`.');

            done();
          }
        );
      });
    });

    it('should bind Model.aggregate(obj[], func) to correct tenant context.', function(done) {
      let TestModel = utils.createTestModel({num: Number});

      TestModel.create({tenantId: 'tenant1', num: 10}, {tenantId: 'tenant1', num: 12}, {tenantId: 'tenant2', num: 20}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant('tenant1').aggregate([{
            $group: {
              _id: '$tenantId',
              sum: {$sum: '$num'}
            }
          }],
          (err, results) => {
            assert(!err, 'Expected Model.aggregate() to work.');
            assert.equal(results.length, 1, 'Expected model aggregation to return exactly one result.');
            assert.equal(results[0].sum, 22, 'Expected the sum up `num` field for `tenant1` to be 22.');
            assert.equal(results[0]._id, 'tenant1', 'Expected the tenant id of aggregated data ser to be `tenant1`.');

            done();
          }
        );
      });
    });
    
    it('should not be able to delete across tenants', (done) => {
      const TestModel = utils.createTestModel({
        test: {
          type: String,
          required: true,
          trim: true
      }});

      const ModelClassT1 = TestModel.byTenant('tenant1');
      const ModelClassT2 = TestModel.byTenant('tenant2');

      const t1Instance = new ModelClassT1({ test: 't1Instance' });
      const t2Instance = new ModelClassT2({ test: 't2Instance' });

      t1Instance.save((err1) => {
        assert(!err1, 'save t1 instance should work');
        t2Instance.save((err2)=> {
          assert(!err2, 'save t2 instance should work');
          ModelClassT2.deleteOne({ _id: t1Instance._id}, (err) => {
            assert(!err, 'error should occour'); // I guess it's fine that no error occours. that is just mongo behaviour
            // however the document should not be deleted, since ModelClassT2 should have no access to elements of tenant1
            ModelClassT1.findOne(t1Instance._id, (err, modelInst) => {
              console.log(err);
              console.log(modelInst);
              assert(modelInst, 'modelInstance should still be available, since it should not be able to delete across tenants');
              done();
            });              
          });
        });
      });      
    });
  });
});
