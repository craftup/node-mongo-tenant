const installMiddleware = require('./index');
const {Schema} = require('mongoose');

describe('middleware', () => {
  it('does not fail', () => {
    const schema = new Schema({});
    installMiddleware(schema);
  });
});
