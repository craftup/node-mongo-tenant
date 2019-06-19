const extendSchema = require('./index');
const buildOptions = require('../options');
const {Schema} = require('mongoose');

describe('schema', () => {
  it('does not fail', () => {
    const schema = new Schema({});
    extendSchema({schema, options: buildOptions()});
  });
});
