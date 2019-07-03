const api = require('./index');
const buildOptions = require('../options');
const dimensionInterface = require('../dimension-interface');
const Mongoose = require('mongoose').Mongoose;
const Schema = require('mongoose').Schema;

describe('api', () => {
  describe('when called with valid params', () => {
    let schema;
    const options = buildOptions({accessorMethod: 'byTenant'});
    beforeEach(() => {
      schema = new Schema({});
      api(schema, options);
    });

    describe('adds static accessor method which', () => {
      let model;
      beforeEach(() => {
        const mongoose = new Mongoose();
        model = mongoose.model('model', schema);
      });

      it('exists', () => {
        expect(schema).toHaveProperty('statics.byTenant');
        expect(model).toHaveProperty('byTenant');
      });

      it('when called returns new model which is not identical to base model', () => {
        const tenantAwareModel = model.byTenant(1);
        expect(tenantAwareModel).not.toBe(model);
      });

      it('when called twice for same dimension value returns identical new models', () => {
        const firstTenantAwareModel = model.byTenant(1);
        const secondTenantAwareModel = model.byTenant(1);
        expect(secondTenantAwareModel).toBe(firstTenantAwareModel);
      });

      it('when called for different dimension values returns different new models', () => {
        const firstTenantAwareModel = model.byTenant(1);
        const secondTenantAwareModel = model.byTenant(2);
        expect(secondTenantAwareModel).not.toBe(firstTenantAwareModel);
      });
    });

    it('keeps track of applied dimensions', () => {
      const hasTenantDimension = dimensionInterface(schema).has('tenant');
      const dimensionOptions = dimensionInterface(schema).get('tenant');

      expect(hasTenantDimension).toBe(true);
      expect(dimensionOptions).toEqual(options);
    });
  });
});
