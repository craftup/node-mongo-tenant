/**
 * Apply tenancy awareness to schema level unique indexes
 * @param {object} schema
 * @param {string} tenantIdKey
 */
const compoundSchemaLevelUniqueIndexes = ({schema, tenantIdKey}) => {
  schema._indexes.forEach((index) => {
    // extend uniqueness of indexes by tenant id field
    // skip if perserveUniqueKey of the index is set to true
    if (index[1].unique === true && index[1].preserveUniqueKey !== true) {
      const tenantAwareIndex = {
        [tenantIdKey]: 1
      };

      for (let indexedField in index[0]) {
        tenantAwareIndex[indexedField] = index[0][indexedField];
      }

      index[0] = tenantAwareIndex;
    }
  });
};

/**
 * Apply tenancy awareness to field level unique indexes
 * @param {object} schema
 * @param {string} tenantIdKey
 */
const compoundFieldLevelUniqueIndexes = ({schema, tenantIdKey}) => {
  schema.eachPath((key, path) => {
    const pathOptions = path.options;

    // skip if preserveUniqueKey of an unique field is set to true
    if (pathOptions.unique === true && pathOptions.preserveUniqueKey !== true) {
      // delete the old index
      path._index = null;
      delete path.options.unique;

      // prepare new options
      let indexOptions = {
        unique: true
      };

      // add sparse option if set in options
      if (pathOptions.sparse) {
        indexOptions.sparse = true;
      }

      // add partialFilterExpression option if set in options
      if (pathOptions.partialFilterExpression) {
        indexOptions.partialFilterExpression = pathOptions.partialFilterExpression;
      }

      // create a new one that includes the tenant id field
      schema.index({
        [tenantIdKey]: 1,
        [key]: 1
      }, indexOptions);
    }
  });
};

module.exports = ({schema, tenantIdKey}) => {
  compoundSchemaLevelUniqueIndexes({schema, tenantIdKey});
  compoundFieldLevelUniqueIndexes({schema, tenantIdKey});
};
