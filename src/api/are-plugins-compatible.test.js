const arePluginsCompatible = require('./are-plugins-compatible');

describe('are-plugins-compatible', () => {
  describe('when called with proper plugin options', () => {
    const options = {
      accessorMethod: 'byTenant',
      tenantIdKey: 'tenantId',
    };

    it("returns true if they have equal tenantIdKey's", () => {
      const a = {...options};
      const b = {...options};
      const result = arePluginsCompatible(a, b);
      expect(result).toBe(true);
    });

    it("returns false if they have different tenantIdKey's", () => {
      const a = {...options};
      const b = {
        ...options,
        tenantIdKey: 'dimensionId',
      };
      const result = arePluginsCompatible(a, b);
      expect(result).toBe(false);
    });
  });
});
