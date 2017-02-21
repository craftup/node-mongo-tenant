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
  describe('#Indexes', function () {
    it('should consider the tenant id field in schema level unique indexes.', function() {
      let
        Model,
        indexesFound = {};

      Model = utils.createTestModel({
        field1: String,
        field2: Number
      }, {
        applyOnSchema: (schema) => {
          schema.index({field1:1}, {unique: true, name: 'index1'});
          schema.index({field2:1}, {name: 'index2'});
          schema.index({field1:1, field2: 1}, {unique: true, name: 'index3'});
        }
      });

      for (let index of Model.schema.indexes()) {
        if (index[1] && index[1].name) {
          indexesFound[index[1].name] = true;

          switch (index[1].name) {
            case 'index1':
              assert('tenantId' in index[0], 'Expected unique index1 to be extended by tenantId field.');
              assert('field1' in index[0], 'Expected unique index1 to contain field1.');
              break;
            case 'index2':
              assert(!('tenantId' in index[0]), 'Expected non unique index2 not to be extended by tenantId field.');
              assert('field2' in index[0], 'Expected non unique index2 to contain field2.');
              break;
            case 'index3':
              assert('tenantId' in index[0], 'Expected unique index3 to be extended by tenantId field.');
              assert('field1' in index[0], 'Expected unique index3 to contain field1.');
              assert('field2' in index[0], 'Expected unique index3 to contain field2.');
              break;
          }
        }
      }

      assert(indexesFound.index1, 'Expected index1 to exist.');
      assert(indexesFound.index2, 'Expected index2 to exist.');
      assert(indexesFound.index3, 'Expected index3 to exist.');
    });

    it('should consider the tenant id field in field level unique indexes.', function() {
      let
        Model, indexesFound = {};

      Model = utils.createTestModel({
        field1: {
          type: String,
          unique: true
        },
        field2: {
          type: Number,
          index: true
        }
      });

      for (let index of Model.schema.indexes()) {
        if ('field1' in index[0]) {
          indexesFound.field1 = true;

          assert('tenantId' in index[0], 'Expected unique index on field1 to be extended by tenantId field.');
          assert(!('field2' in index[0]), 'Expected unique index on field1 not to contain field2.');
        }

        if ('field2' in index[0]) {
          indexesFound.field2 = true;

          assert(!('tenantId' in index[0]), 'Expected non unique index on field2 not to be extended by tenantId field.');
          assert(!('field1' in index[0]), 'Expected non unique index on field2 not to contain field1.');
        }
      }

      assert(indexesFound.field1, 'Expected index on field1 to exist.');
      assert(indexesFound.field2, 'Expected index on field2 to exist.');
    });
  });
});
