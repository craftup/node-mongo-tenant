const dimensionInterface = require('../../dimension-interface');

// we need to return `function () {}` here so injection of `this` works
// properly
module.exports = ({dimension, dimensionIdKey, dimensionIdGetter}) =>
  function(next) {
    if (dimensionInterface(this.constructor).has(dimension)) {
      this[dimensionIdKey] = this.constructor[dimensionIdGetter]();
    }

    next();
  };
