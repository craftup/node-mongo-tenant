const convertArgumentsToArray = args => [].slice.call(args);

const extractCallback = args => {
  const lastIndex = args.length - 1;
  const lastElement = args[lastIndex];
  return typeof lastElement === 'function'
    ? {
        arguments: args.slice(0, lastIndex),
        callback: lastElement,
      }
    : {arguments: [...args], callback: undefined};
};

/**
 * Parse arguments of Model.aggregate
 *
 * Model.aggregate accepts a wide range of possible arguments:
 * - [] - nothing
 * - [{...}] - single pipeline element (4.x)
 * - [{...}, fn] - single pipeline with callback (4.x)
 * - [{...}, {...}] - multiple pipeline elements (4.x)
 * - [{...}, {...}, fn] - multiple pipelines elements with callback (4.x)
 * - [[{...}]] - list of pipeline elements
 * - [[{...}], fn] - list of pipeline elements with callback
 *
 * @param {(array|arguments)} args
 * @returns {{pipeline: array, callback: ?function}}
 */
module.exports = args => {
  const argsAsArray = convertArgumentsToArray(args);
  const {arguments: argsWithoutCallback, callback} = extractCallback(
    argsAsArray
  );

  const pipeline =
    argsWithoutCallback.length === 1 && Array.isArray(argsWithoutCallback[0])
      ? argsWithoutCallback[0]
      : argsWithoutCallback;

  return {pipeline, callback};
};
