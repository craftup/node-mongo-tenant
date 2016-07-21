# Multi Tenancy Plugin for Mongoose

[![Build Status](https://travis-ci.org/craftup/node-mongo-tenant.png?branch=master)](https://travis-ci.org/craftup/node-mongo-tenant)
[![Coverage Status](https://coveralls.io/repos/github/craftup/node-mongo-tenant/badge.svg?branch=master)](https://coveralls.io/github/craftup/node-mongo-tenant?branch=master)

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
```

### LICENSE

The files in this archive are released under MIT license.
You can find a copy of this license in [LICENSE](https://github.com/craftup/node-mongo-tenant/raw/master/LICENSE).
