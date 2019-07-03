const symbolDimensions = require('./symbol-dimensions');

/**
 * Interface to handle dimensions of base model
 * @param {*} subject
 */
module.exports = subject => {
  if (!subject) {
    throw new Error('No subject');
  }
  return {
    /**
     * Add a dimension
     * @param {string} dimension
     * @param {MongoTenantOptions} options
     */
    add: (dimension, options) => {
      const dimensions = subject[symbolDimensions] || new Map();
      if (dimensions.has(dimension) && dimensions.get(dimension) !== options) {
        throw new Error(
          `MongoTenant: Dimension "${dimension}" already applied to model "${subject.modelName ||
            '<unknown model>'}"`
        );
      }
      dimensions.set(dimension, options);
      subject[symbolDimensions] = dimensions;
    },
    /**
     * Get dimension settings of subject if it exists
     * @param {string} dimension
     * @returns {MongoTenantOptions|undefined}
     */
    get: dimension =>
      (subject[symbolDimensions] && subject[symbolDimensions].get(dimension)) ||
      undefined,
    /**
     * Check if dimension on subject exists
     * @param dimension
     * @returns {boolean}
     */
    has: dimension =>
      (subject[symbolDimensions] && subject[symbolDimensions].has(dimension)) ||
      false,
  };
};
