const parse = require('./parse-aggregate-arguments');

describe('parse-aggregate-arguments', () => {
  const callback = () => {};

  it('parses empty argument list', () => {
    const result = parse([]);
    expect(result).toEqual({
      pipeline: [],
      callback: undefined,
    });
  });

  it('parses single pipeline element (4.x compatibility)', () => {
    const result = parse([{}]);
    expect(result).toEqual({
      pipeline: [{}],
      callback: undefined,
    });
  });

  it('parses single pipeline element and callback (4.x compatibility)', () => {
    const result = parse([{}, callback]);
    expect(result).toEqual({
      pipeline: [{}],
      callback,
    });
  });

  it('parses multiple pipeline elements (4.x compatibility)', () => {
    const result = parse([{a: 1}, {b: 2}]);
    expect(result).toEqual({
      pipeline: [{a: 1}, {b: 2}],
      callback: undefined,
    });
  });

  it('parses multiple pipeline elements and callback (4.x compatibility)', () => {
    const result = parse([{a: 1}, {b: 2}, callback]);
    expect(result).toEqual({
      pipeline: [{a: 1}, {b: 2}],
      callback,
    });
  });

  it('parses pipeline list', () => {
    const result = parse([[{a: 1}, {b: 2}]]);
    expect(result).toEqual({
      pipeline: [{a: 1}, {b: 2}],
      callback: undefined,
    });
  });

  it('parses pipeline list and callback', () => {
    const result = parse([[{a: 1}, {b: 2}], callback]);
    expect(result).toEqual({
      pipeline: [{a: 1}, {b: 2}],
      callback,
    });
  });
});
