/**
 * Apply tenancy awareness to schema level unique indexes
 * @param {object} schema
 * @param {string} tenantIdKey
 */
const compoundSchemaLevelUniqueIndexes = ({schema, tenantIdKey}) => {
  schema._indexes.forEach(index => {
    // extend uniqueness of indexes by tenant id field
    // skip if perserveUniqueKey of the index is set to true
    if (index[1].unique === true && index[1].preserveUniqueKey !== true) {
      const tenantAwareIndex = {
        [tenantIdKey]: 1,
      };

      for (let indexedField in index[0]) {
        tenantAwareIndex[indexedField] = index[0][indexedField];
      }

      index[0] = tenantAwareIndex;
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
 * @param {string} tenantIdKey
 */
const compoundFieldLevelUniqueIndexes = ({schema, tenantIdKey}) => {
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

      // create a new one that includes the tenant id field
      schema.index(
        {
          [tenantIdKey]: 1,
          [key]: 1,
        },
        schemaIndexOptions
      );

      removeFieldLevelIndex(path);
    }
  });
};

module.exports = ({schema, tenantIdKey}) => {
  compoundSchemaLevelUniqueIndexes({schema, tenantIdKey});
  compoundFieldLevelUniqueIndexes({schema, tenantIdKey});
};
