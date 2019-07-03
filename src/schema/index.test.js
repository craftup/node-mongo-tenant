const extendSchema = require('./index');
const {Schema} = require('mongoose');

describe('schema', () => {
  it('does not fail', () => {
    const schema = new Schema({});
    extendSchema(schema);
  });
});
