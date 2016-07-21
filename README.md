# Multi Tenancy Plugin for Mongoose

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
