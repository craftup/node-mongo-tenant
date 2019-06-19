const addTenantIdField = require('./add-tenant-id-field');

describe('add-tenant-id-field', () => {
  describe('when called with valid parameters', () => {
    it('adds a field for tenant id', () => {
      const schema = {
        add: jest.fn(),
      };
      addTenantIdField({schema, key: 'tenantId', type: String, required: true});
      expect(schema.add).toBeCalledWith({
        tenantId: {
          index: true,
          type: String,
          required: true,
        }
      });
    });
  });
});
