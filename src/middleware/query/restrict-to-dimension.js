const dimensionInterface = require('../../dimension-interface');

module.exports = ({dimension, dimensionIdKey, dimensionIdGetter}) =>
  function(next) {
    if (dimensionInterface(this.model).has(dimension)) {
      this._conditions[dimensionIdKey] = this.model[dimensionIdGetter]();
    }

    next();
  };
