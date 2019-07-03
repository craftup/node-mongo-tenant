const dimensionInterface = require('./dimension-interface');

describe('dimension-interface', () => {
  describe('when instantiated', () => {
    let source;
    let subject;
    beforeEach(() => {
      source = {};
      subject = dimensionInterface(source);
    });

    it('reports a unset dimension as unset', () => {
      const result = subject.has('never-set');
      expect(result).toBe(false);
    });

    it('reports a added dimension as existing', () => {
      subject.add('test', {});
      const result = subject.has('test');
      expect(result).toBe(true);
    });

    it('throws an error when dimension with different options is added multiple times', () => {
      subject.add('test', {});
      const fn = () => {
        subject.add('test', {});
      };

      expect(fn).toThrow();
    });

    it('does not throw an error when dimension with identical options is added multiple times', () => {
      const options = {};
      subject.add('test', options);
      subject.add('test', options);
    });

    it('returns `undefined` when getting unknown dimension', () => {
      const result = subject.get('test');
      expect(result).toBeUndefined();
    });

    it('returns options of added dimension', () => {
      const options = {};
      subject.add('test', options);
      const result = subject.get('test');
      expect(result).toBe(options);
    });
  });
});
