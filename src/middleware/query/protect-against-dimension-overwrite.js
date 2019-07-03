const dimensionInterface = require('../../dimension-interface');

const replacementOperations = ['findOneAndReplace', 'replaceOne'];
const isReplacementOperation = value => replacementOperations.includes(value);

module.exports = ({dimension, dimensionIdKey, dimensionIdGetter}) =>
  function(next) {
    if (dimensionInterface(this.model).has(dimension)) {
      const dimensionId = this.model[dimensionIdGetter]();

      // avoid jumping dimension context when overwriting a model.
      if (
        dimensionIdKey in this._update ||
        this.options.overwrite ||
        isReplacementOperation(this.op)
      ) {
        this._update[dimensionIdKey] = dimensionId;
      }

      // avoid jumping dimension context from $set operations
      const $set = this._update.$set;
      if (
        $set &&
        dimensionIdKey in $set &&
        $set[dimensionIdKey] !== dimensionId
      ) {
        $set[dimensionIdKey] = dimensionId;
      }
    }

    next();
  };
