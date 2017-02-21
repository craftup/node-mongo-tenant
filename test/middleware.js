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
  describe('#Middleware', function() {
    utils.clearDatabase();

    it('should bind tenant context to Model.count().', function(done) {
      let
        TestModel = utils.createTestModel({});

      TestModel.byTenant(1).create({}, {}, {}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant(1).count((err, count) => {
          assert(!err, 'Expected entity counting to work.');
          assert.equal(count, 3, 'Expected 3 entries for tenant `1`.');

          TestModel.byTenant(2).count((err, count) => {
            assert(!err, 'Expected entity counting to work.');
            assert.equal(count, 0, 'Expected 0 entries for tenant `2`.');

            done();
          });
        });
      });
    });

    it('should avoid tenant context jumping on Model.count().', function(done) {
      let
        TestModel = utils.createTestModel({});

      TestModel.byTenant(1).create({}, {}, {}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant(2).count({tenantId: 1}, (err, count) => {
          assert(!err, 'Expected entity counting to work.');
          assert.equal(count, 0, 'Expected 0 entries for tenant `2`.');

          TestModel.byTenant(1).count({tenantId: 2}, (err, count) => {
            assert(!err, 'Expected entity counting to work.');
            assert.equal(count, 3, 'Expected 3 entries for tenant `1`.');

            done();
          });
        });
      });
    });

    it('should not affect Model.count() when not in tenant context.', function(done) {
      let TestModel = utils.createTestModel({});

      TestModel.create({tenantId: 1}, {tenantId: 2}, {tenantId: 3}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.count((err, count) => {
          assert(!err, 'Expected entity counting to work.');
          assert.equal(count, 3, 'Expected 3 entries for all tenants.');

          done();
        });
      });
    });

    it('should bind tenant context to Model.find().', function(done) {
      let
        TestModel = utils.createTestModel({});

      TestModel.byTenant('tenant1').create({}, {}, {}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant('tenant1').find({}, (err, entities) => {
          assert(!err, 'Expected entity search to work.');
          assert.equal(entities.length, 3, 'Expected to find 3 entities for `tenant1`.');

          TestModel.byTenant('tenant2').find({}, (err, entities) => {
            assert(!err, 'Expected entity search to work.');
            assert.equal(entities.length, 0, 'Expected to find no entities for `tenant2`.');

            done();
          });
        });
      });
    });

    it('should avoid tenant context jumping on Model.find().', function(done) {
      let
        TestModel = utils.createTestModel({});

      TestModel.byTenant('tenant1').create({}, {}, {}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant('tenant2').find({tenantId: 'tenant1'}, (err, entities) => {
          assert(!err, 'Expected entity search to work.');
          assert.equal(entities.length, 0, 'Expected to find 0 entities for `tenant2`.');

          TestModel.byTenant('tenant1').find({tenantId: 'tenant2'}, (err, entities) => {
            assert(!err, 'Expected entity search to work.');
            assert.equal(entities.length, 3, 'Expected to find 3 entities for `tenant1`.');

            done();
          });
        });
      });
    });

    it('should bind tenant context to Model.findOne().', function(done) {
      let TestModel = utils.createTestModel({});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2'}, {tenantId: 'tenant3'}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant('tenant1').findOne((err, model) => {
          assert(!err, 'Expected entity search by `Model.findOne` to work.');
          assert.equal(model.tenantId, 'tenant1', 'Expected the found entity to be bound to the correct tenant.');

          TestModel.byTenant('tenant4').findOne((err, model) => {
            assert(!err, 'Expected entity search by `Model.findOne` to work.');
            assert(!model, 'Expected the found no entity in the context of `tenant4`.');

            done();
          });
        });
      });
    });

    it('should avoid tenant context jumping on Model.findOne().', function(done) {
      let
        TestModel = utils.createTestModel({});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2'}, {tenantId: 'tenant3'}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant('tenant1').findOne({tenantId: 'tenant2'}, (err, model) => {
          assert(!err, 'Expected entity search by `Model.findOne` to work.');
          assert.equal(model.tenantId, 'tenant1', 'Expected the found entity to be bound to the correct tenant.');

          TestModel.byTenant('tenant4').findOne({tenantId: 'tenant1'}, (err, model) => {
            assert(!err, 'Expected entity search by `Model.findOne` to work.');
            assert(!model, 'Expected to find no entity in the context of `tenant4`.');

            done();
          });
        });
      });
    });

    it('should bind tenant context to Model.findOneAndRemove().', function(done) {
      let
        TestModel = utils.createTestModel({});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2'}, {tenantId: 'tenant3'}, (err) => {
        assert(!err, 'Expected creation of 3 test entities to work.');

        TestModel.byTenant('tenant1').findOneAndRemove({}, (err, model) => {
          assert(!err, 'Expected method `Model.findOneAndRemove` to work.');
          assert.equal(model.tenantId, 'tenant1', 'Expected the removed entity to be bound to the correct tenant.');

          TestModel.byTenant('tenant4').findOneAndRemove({}, (err, model) => {
            assert(!err, 'Expected method `Model.findOneAndRemove` to work.');
            assert(!model, 'Expected to removed no entity in the context of `tenant4`.');

            done();
          });
        });
      });
    });

    it('should bind tenant context to Model.findOneAndUpdate().', function(done) {
      let TestModel = utils.createTestModel({someField: String});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2'}, (err) => {
        assert(!err, 'Expected creation of 2 test entities to work.');

        TestModel.byTenant('tenant1').findOneAndUpdate({}, {someField: 'some-value'}, {'new': true}, (err, entity) => {
          assert(!err, 'Expected Model.findOneAndUpdate to work.');
          assert.equal(entity.tenantId, 'tenant1', 'Expected the found entity to be bound to the correct tenant.');
          assert.equal(entity.someField, 'some-value', 'Expected the updated entity to have someField set to some-value');

          TestModel.byTenant('tenant3').findOneAndUpdate({}, {someField: 'some-value'}, (err, entity) => {
            assert(!err, 'Expected Model.findOneAndUpdate to work.');
            assert(!entity, 'Expected to not update any entity for tenant4.');

            done();
          });
        });
      });
    });

    it('should bind tenant context to Model.save().', function(done) {
      let
        Model = utils.createTestModel({}).byTenant(1),
        model = new Model();

      model.save((err, obj) => {
        assert(!err, 'Expected model persistance to work');
        assert.equal(obj.tenantId, 1, 'Expected tenantId to be automatically set to `1`.');

        done();
      });
    });

    it('should avoid tenant jumping on Model.save().', function(done) {
      let
        Model = utils.createTestModel({}).byTenant(1),
        model = new Model();

      model.set('tenantId', 2);

      model.save((err, obj) => {
        assert(!err, 'Expected model persistance to work');
        assert.equal(obj.tenantId, 1, 'Expected tenantId to be automatically set to `1`.');

        done();
      });
    });

    it('should bind tenant context to static Model.create() method.', function(done) {
      let
        Model = utils.createTestModel({}).byTenant(1);

      Model.create({}, (err, obj) => {
        assert(!err, 'Expected model persistance to work');
        assert.equal(obj.tenantId, 1, 'Expected tenantId to be automatically set to `1`.');

        done();
      });
    });

    it('should avoid tenant jumping on static Model.create() method.', function(done) {
      let
        Model = utils.createTestModel({}).byTenant(1);

      Model.create({tenantId: 2}, (err, obj) => {
        assert(!err, 'Expected model persistance to work');
        assert.equal(obj.tenantId, 1, 'Expected tenantId to be automatically set to `1`.');

        done();
      });
    });

    it('should bind tenant context to Model.update().', function(done) {
      let TestModel = utils.createTestModel({someField: String});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2'}, (err) => {
        assert(!err, 'Expected creation of 2 test entities to work.');

        TestModel.byTenant('tenant1').update({}, {someField: 'some-value'}, (err) => {
          assert(!err, 'Expected model update to work.');

          TestModel.byTenant('tenant1').find({}, (err, entities) => {
            assert(!err, 'Expected entity search by Model.find to work.');

            for (let entity of entities) {
              assert.equal(entity.someField, 'some-value', 'Expected updated value of someField to be `some-value`.');
            }

            done();
          });
        });
      });
    });

    it('should avoid overwriting tenant context on Model.update().', function(done) {
      let TestModel = utils.createTestModel({someField: String});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2'}, (err) => {
        assert(!err, 'Expected creation of 2 test entities to work.');

        TestModel.byTenant('tenant1').update({}, {tenantId: 'tenant2', someField: 'some-value'}, (err) => {
          assert(!err, 'Expected model update to work.');

          TestModel.byTenant('tenant1').find({}, (err, entities) => {
            assert(!err, 'Expected entity search by Model.find to work.');
            assert.equal(entities.length, 1, 'Expected to find exactly 1 entity.');
            assert.equal(entities[0].someField, 'some-value', 'Expected updated value of someField to be `some-value`.');

            done();
          });
        });
      });
    });

    it('should preserve tenant context on Model.update() with truthy overwrite option.', function(done) {
      let TestModel = utils.createTestModel({someField: String});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2'}, (err) => {
        assert(!err, 'Expected creation of 2 test entities to work.');

        TestModel.byTenant('tenant1').update({}, {tenantId: 'tenant2', someField: 'some-value'}, {overwrite: true}, (err) => {
          assert(!err, 'Expected model update to work.');

          TestModel.byTenant('tenant1').find({}, (err, entities) => {
            assert(!err, 'Expected entity search by Model.find to work.');
            assert.equal(entities.length, 1, 'Expected to find exactly 1 entity.');
            assert.equal(entities[0].someField, 'some-value', 'Expected updated value of someField to be `some-value`.');

            done();
          });
        });
      });
    });

    it('should not affect Model.update() when not in tenant context.', function(done) {
      let TestModel = utils.createTestModel({someField: String});

      TestModel.create({tenantId: 'tenant1'}, {tenantId: 'tenant2', someField: 'some-value'}, (err) => {
        assert(!err, 'Expected creation of 2 test entities to work.');

        TestModel.update({tenantId: 'tenant1'}, {tenantId: 'tenant2', someField: 'some-value'}, (err) => {
          assert(!err, 'Expected model update to work.');

          TestModel.find({}, (err, entities) => {
            assert(!err, 'Expected entity search by Model.find to work.');
            assert.equal(entities.length, 2, 'Expected to find exactly 2 entity.');
            assert.equal(entities[0].someField, 'some-value', 'Expected updated value of someField to be `some-value`.');
            assert.equal(entities[0].tenantId, 'tenant2', 'Expected updated tenantId to be `tenant2`.');
            assert.equal(entities[1].someField, 'some-value', 'Expected updated value of someField to be `some-value`.');
            assert.equal(entities[1].tenantId, 'tenant2', 'Expected updated tenantId to be `tenant2`.');

            done();
          });
        });
      });
    });
  });
});
