const options = require('./options');

describe('options', () => {
  const expectCompleteOptions = value => {
    expect(value).toHaveProperty('dimensionIdKey');
    expect(value).toHaveProperty('dimensionIdType');
    expect(value).toHaveProperty('accessorMethod');
    expect(value).toHaveProperty('dimensionIdGetter');
    expect(value).toHaveProperty('requireDimensionId');
  };

  it('creates default options', () => {
    const result = options();
    expectCompleteOptions(result);
  });

  it('adds default option values', () => {
    const result = options({dimensionIdKey: 'tenant_id'});
    expectCompleteOptions(result);
  });

  it('customizes default values depending on dimension', () => {
    const result = options({dimension: 'customer'});
    expectCompleteOptions(result);
    expect(result).toMatchObject({
      dimensionIdKey: 'customerId',
      accessorMethod: 'byCustomer',
      dimensionIdGetter: 'getCustomerId',
    });
  });

  it('handles legacy options', () => {
    const result = options({
      tenantIdKey: 'tenant_id',
      tenantIdType: Number,
      tenantIdGetter: 'get_tenant_id',
      requireTenantId: false,
    });
    expect(result).toMatchObject({
      dimensionIdKey: 'tenant_id',
      dimensionIdType: Number,
      dimensionIdGetter: 'get_tenant_id',
      requireDimensionId: false,
    });
  });
});
