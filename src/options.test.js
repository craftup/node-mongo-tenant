const options = require('./options');

describe('options', () => {
  const assertCompleteOptions = (value) => {
    expect(value).toHaveProperty('tenantIdKey');
    expect(value).toHaveProperty('tenantIdType');
    expect(value).toHaveProperty('accessorMethod');
    expect(value).toHaveProperty('tenantIdGetter');
    expect(value).toHaveProperty('requireTenantId');
  };

  it('creates default options', () => {
    const result = options();
    assertCompleteOptions(result);
  });

  it('adds default option values', () => {
    const result = options({tenantIdKey: 'tenant_id'});
    assertCompleteOptions(result);
  });
});
