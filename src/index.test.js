const plugin = require('./index');
const Schema = require('mongoose').Schema;

describe('plugin', () => {
  describe('applied to schema', () => {
    let schema;
    beforeEach(() => {
      schema = new Schema({});
    });

    describe('with options', () => {
      it('does not fail', () => {
        schema.plugin(plugin, {});
      });
    });

    describe('without options', () => {
      it('does not fail', () => {
        schema.plugin(plugin);
      });
    });
  });
});
