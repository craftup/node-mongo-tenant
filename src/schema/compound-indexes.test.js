const compoundIndexes = require('./compound-indexes');
const {Schema} = require('mongoose');

describe('compound-indexes', () => {
  describe('when called with valid parameters', () => {
    const tenantIdKey = 'tenantId';

    describe('where schema has schema level index', () => {
      let schema;
      beforeEach(() => {
        schema = new Schema({
          id: String,
        });
      });

      describe('and index is unique', () => {
        describe('with unique key preservation disabled', () => {
          it('compounds the index', () => {
            schema.index({id: 1}, {unique: true, preserveUniqueKey: false});
            compoundIndexes({schema, tenantIdKey});
            expect(schema.indexes()).toEqual([
              [{id: 1, [tenantIdKey]: 1}, {unique: true, background: true}],
            ]);
          });
        });

        describe('with unique key preservation enabled', () => {
          it('does NOT compound the index', () => {
            schema.index({id: 1}, {unique: true, preserveUniqueKey: true});
            compoundIndexes({schema, tenantIdKey});
            expect(schema.indexes()).toEqual([
              [{id: 1}, {unique: true, background: true}],
            ]);
          });
        });
      });

      describe('and index is NOT unique', () => {
        it('does NOT compounds the index', () => {
          schema.index({id: 1});
          compoundIndexes({schema, tenantIdKey});
          expect(schema.indexes()).toEqual([[{id: 1}, {background: true}]]);
        });
      });
    });

    describe('where schema has field level index', () => {
      describe('and index is unique', () => {
        describe('with unique key preservation disabled', () => {
          it('compounds the index', () => {
            const schema = new Schema({
              id: {
                type: String,
                unique: true,
                preserveUniqueKey: false,
              },
            });
            compoundIndexes({schema, tenantIdKey});
            expect(schema.indexes()).toEqual([
              [{id: 1, [tenantIdKey]: 1}, {unique: true, background: true}],
            ]);
          });

          it('adds other options to compound index', () => {
            const schema = new Schema({
              id: {
                type: String,
                index: {
                  unique: true,
                  sparse: true,
                  partialFilterExpression: {},
                },
                preserveUniqueKey: false,
              },
            });
            compoundIndexes({schema, tenantIdKey});
            expect(schema.indexes()).toMatchObject([
              [
                {id: 1, [tenantIdKey]: 1},
                {
                  unique: true,
                  sparse: true,
                  partialFilterExpression: {},
                },
              ],
            ]);
          });
        });

        describe('with unique key preservation enabled', () => {
          it('does NOT compound the index', () => {
            const schema = new Schema({
              id: {
                type: String,
                unique: true,
                preserveUniqueKey: true,
              },
            });
            compoundIndexes({schema, tenantIdKey});
            expect(schema.indexes()).toEqual([
              [{id: 1}, {unique: true, background: true}],
            ]);
          });
        });
      });
      describe('and index is NOT unique', () => {
        it('does NOT compound the index', () => {
          const schema = new Schema({
            id: {
              type: String,
              index: true,
            },
          });
          compoundIndexes({schema, tenantIdKey});
          expect(schema.indexes()).toEqual([[{id: 1}, {background: true}]]);
        });
      });
    });
  });
});
