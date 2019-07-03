/**
 * Apply dimension awareness to schema level unique indexes
 * @param {object} schema
 * @param {string} dimensionIdKey
 */
const compoundSchemaLevelUniqueIndexes = ({schema, dimensionIdKey}) => {
  schema._indexes.forEach(index => {
    // extend uniqueness of indexes by dimension id field
    // skip if preserveUniqueKey of the index is set to true
    if (index[1].unique === true && index[1].preserveUniqueKey !== true) {
      const dimensionAwareIndex = {
        [dimensionIdKey]: 1,
      };

      for (let indexedField in index[0]) {
        dimensionAwareIndex[indexedField] = index[0][indexedField];
      }

      index[0] = dimensionAwareIndex;
    }
    // remove preserveUniqueKey field to avoid confusing mongodb 3.x
    delete index[1].preserveUniqueKey;
  });
};

const shouldPreserveUniqueIndex = options => {
  if (
    options &&
    options.index &&
    options.index.preserveUniqueKey !== undefined
  ) {
    return options.index.preserveUniqueKey === true;
  }
  if (options && options.preserveUniqueKey !== undefined) {
    return options.preserveUniqueKey === true;
  }

  return false;
};

const removeFieldLevelIndex = path => {
  path._index = null;
  delete path.options.unique;
};

/**
 * Apply tenancy awareness to field level unique indexes
 * @param {object} schema
 * @param {string} dimensionIdKey
 */
const compoundFieldLevelUniqueIndexes = ({schema, dimensionIdKey}) => {
  schema.eachPath((key, path) => {
    const pathOptions = path.options;
    const indexOptions = path._index;

    // skip if preserveUniqueKey of an unique field is set to true
    const isUniqueIndex =
      (indexOptions && indexOptions.unique) || pathOptions.unique;
    if (isUniqueIndex && !shouldPreserveUniqueIndex(pathOptions)) {
      // prepare new options
      const schemaIndexOptions = {
        ...(indexOptions || {}),
        unique: true,
      };

      // create a new one that includes the dimension id field
      schema.index(
        {
          [dimensionIdKey]: 1,
          [key]: 1,
        },
        schemaIndexOptions
      );

      removeFieldLevelIndex(path);
    }
  });
};

module.exports = ({schema, dimensionIdKey}) => {
  compoundSchemaLevelUniqueIndexes({schema, dimensionIdKey});
  compoundFieldLevelUniqueIndexes({schema, dimensionIdKey});
};
