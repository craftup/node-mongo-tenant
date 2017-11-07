# Multi Tenancy Plugin for Mongoose

[![Subscribe to Release Notes](https://release-notes.com/badges/v1.svg)](https://release-notes.com/@craftup/node-mongo-tenant)
[![Get Help on Gitter](https://img.shields.io/gitter/room/RealMQ/node-mongo-tenant.svg)](https://gitter.im/RealMQ/node-mongo-tenant)
[![Build Status](https://travis-ci.org/craftup/node-mongo-tenant.png?branch=master)](https://travis-ci.org/craftup/node-mongo-tenant)
[![Coverage Status](https://coveralls.io/repos/github/craftup/node-mongo-tenant/badge.svg?branch=master)](https://coveralls.io/github/craftup/node-mongo-tenant?branch=master)
[![npm version](https://badge.fury.io/js/mongo-tenant.svg)](https://badge.fury.io/js/mongo-tenant)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/craftup/node-mongo-tenant/master/LICENSE)

## Prelude

There are 3 ways of implementing multi-tenancy in mongoDB:

- on document level (cheap and easy to administer but only secured by app logic)
- on collection level (not recommended, due to breaking mongoDB concepts)
- on database level (very flexible and secure but expensive)

## About

The mongo tenant is a highly configurable mongoose plugin solving multi-tenancy problems on
document level (for now...). 
It creates a tenant-reference field and takes care of unique indexes.
Also it provides access to tenant-bound model-classes, that prohibit the
exploid of the given tenant scope.
Last but not least the "MAGIC" can be disabled so that shipping of the
same code in single- and multi-tenancy environment (on premis vs. cloud hosted)
is a question of a single line of config.

## Requirements

Tested with mongoose from version >= 4.3.0.

## Incompatibilities

* Mongo Tenant is incomapatible with mongoose 4.8.1-4.8.2 see [Automattic/mongoose#4947](https://github.com/Automattic/mongoose/issues/4947).

## Install

`$ npm install --save mongo-tenant`

## Use

Register the plugin on the relevant mongoose schema.

```javascript
const
  mongoose = require('mongoose'),
  mongoTenant = require('mongo-tenant');

let MySchema = new mongoose.Schema({});
MySchema.plugin(mongoTenant);

let MyModel = mongoose.model('MyModel', MySchema);
```

Retrieve the model in tenant scope with static `byTenant` method. This will return
a new model subclass that has special tenant-scope guards.
It has the exactly same interface as any other mongoose model but prevents
the access to other tenant scopes.

```javascript
let MyTenantBoundModel = MyModel.byTenant('some-tenant-id');

(new MyTenantBoundModel()).getTenantId() === 'some-tenant-id'; // true

// silently ignore other tenant scope
(new MyTenantBoundModel({
  tenantId: 'some-other-tenant-id'
})).getTenantId() === 'some-tenant-id'; // true

```

You can check for tenant context of a model class or instance by checking
the `hasTenantContext` property. If this is truthy you may want to retrieve
the bound tenant scope with `getTenantId()` method.

```javascript

// With enabled mongo-tenant on a schema, all tenant bound models
// and there instances provide the hasTenantContext flag
if (SomeModelClassOrInstance.hasTenantContext) {
  let tenantId = SomeModelClassOrInstance.getTenantId();
  ...
}
```

### Indexes

The mongo-tenant takes care of the tenant-reference field, so that you
will be able to use your existing schema definitions and just plugin the
mongo-tenant without changing a single line of schema definition.

But under the hood the mongo-tenant creates an indexed field *(tenantId by default)*
and includes this in all defined unique indexes. So by default, all unique 
fields (and compound indexes) are unique for a single tenant id.

You may have use-cases where you want to archive global uniqueness.
To skip the automatic unique key extension of mongo-tenant for a specific
index you can set the `preserveUniqueKey` config option to true.

```javascript
let MySchema = new mongoose.Schema({
  someField: {
    unique: true,
    preserveUniqueKey: true
  },
  anotherField: String,
  yetAnotherField: String
});

MySchema.index({
  anotherField: 1,
  yetAnotherField: 1
}, {
  unique: true,
  preserveUniqueKey: true
});
```

### Configuration

The mongo tenant works out of the box, so all config options are optional.
But you have the ability to adjust the behavior and api of the mongo tenant
to your needs.

```javascript
let config = {
  /**
   * Whether the mongo tenant plugin MAGIC is enabled. Default: true
   */
  enabled: false,

  /**
   * The name of the tenant id field. Default: tenantId
   */
  tenantIdKey: 'customerId',

  /**
   * The type of the tenant id field. Default: String
   */
  tenantIdType: Number,

  /**
   * The name of the tenant id getter method. Default: getTenantId
   */
  tenantIdGetter: 'getCustomerId',

  /**
   * The name of the tenant bound model getter method. Default: byTenant
   */
  accessorMethod: 'byCustomer',

  /**
   * Enforce tenantId field to be set. Default: false
   * NOTE: this option will become enabled by default in mongo-tenant@2.0
   */
  requireTenantId: true
};

SomeSchema.plugin(mongoTenant, config);
```

### Running Tests

Some tests rely on a running mongoDB and by default the tests are performed
against 'mongodb://localhost/mongo-tenant-test'.
The tests can also be run against a custom mongoDB by passing the
custom connection string to **MONGO_URI** environment variable.

```sh
# perform jshint on sources and tests
$ npm run hint

# run the tests and gather coverage report
$ npm run test-and-cover

# run tests with custom mongoDB uri
$ MONGO_URI='mongodb://user:password@xyz.mlab.com:23315/mongo-tenant-test' npm run test-and-cover
```

### LICENSE

The files in this archive are released under MIT license.
You can find a copy of this license in [LICENSE](https://github.com/craftup/node-mongo-tenant/raw/master/LICENSE).
