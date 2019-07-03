const arePluginsCompatible = require('./are-plugins-compatible');

describe('are-plugins-compatible', () => {
  describe('when called with proper plugin options', () => {
    const options = {
      dimension: 'dim',
      accessorMethod: 'byDim',
      dimensionIdKey: 'dimId',
    };

    it("returns true if they have equal dimension's", () => {
      const a = {...options};
      const b = {...options};
      const result = arePluginsCompatible(a, b);
      expect(result).toBe(true);
    });

    it("returns false if they have different dimension's", () => {
      const a = {...options};
      const b = {
        ...options,
        dimension: 'universe',
      };
      const result = arePluginsCompatible(a, b);
      expect(result).toBe(false);
    });
  });
});
