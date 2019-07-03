const patchDocument = ({document, dimensionId, dimensionIdKey}) => ({
  ...document,
  [dimensionIdKey]: dimensionId,
});

const patchFilter = ({filter, dimensionId, dimensionIdKey}) => ({
  ...(filter || {}),
  [dimensionIdKey]: dimensionId,
});

const forbiddenUpdateOperations = [
  '$bit',
  '$currentDate',
  '$inc',
  '$min',
  '$max',
  '$mul',
  '$rename',
  '$unset',
];
const patchableUpdateOperations = ['$set', '$setOnInsert'];
const patchUpdate = ({update, dimensionId, dimensionIdKey}) => {
  const forbiddenOpsUsed = Object.entries(update).reduce(
    (ops, [op, fields]) => {
      if (
        forbiddenUpdateOperations.includes(op) &&
        Object.keys(fields).includes(dimensionIdKey)
      ) {
        ops.push(op);
      }
      return ops;
    },
    []
  );
  if (forbiddenOpsUsed.length > 0) {
    throw new Error(
      `Modification of ${dimensionIdKey} via bulkInsert update (${forbiddenOpsUsed.join(
        ', '
      )}`
    );
  }

  const patchedUpdate = {...update};
  patchableUpdateOperations.forEach(op => {
    if (
      patchedUpdate[op] &&
      Object.keys(patchedUpdate[op]).includes(dimensionIdKey)
    ) {
      patchedUpdate[op][dimensionIdKey] = dimensionId;
    }
  });

  return patchedUpdate;
};

const modifyInsert = ({
  dimensionId,
  dimensionIdKey,
  op: {document, ...rest},
}) => ({
  document: patchDocument({document, dimensionId, dimensionIdKey}),
  ...rest,
});

const modifyUpdate = ({
  dimensionId,
  dimensionIdKey,
  op: {filter, update, ...rest},
}) => ({
  filter: patchFilter({filter, dimensionId, dimensionIdKey}),
  update: patchUpdate({update, dimensionId, dimensionIdKey}),
  ...rest,
});

const modifyReplace = ({
  dimensionId,
  dimensionIdKey,
  op: {filter, replacement, ...rest},
}) => ({
  filter: patchFilter({filter, dimensionId, dimensionIdKey}),
  replacement: patchDocument({
    document: replacement,
    dimensionId,
    dimensionIdKey,
  }),
  ...rest,
});

const modifyDelete = ({
  dimensionId,
  dimensionIdKey,
  op: {filter, ...rest},
}) => ({
  filter: patchFilter({filter, dimensionId, dimensionIdKey}),
  ...rest,
});

const opToModifierMap = {
  insertOne: modifyInsert,
  updateOne: modifyUpdate,
  updateMany: modifyUpdate,
  replaceOne: modifyReplace,
  deleteOne: modifyDelete,
  deleteMany: modifyDelete,
};

module.exports = ({ops, dimensionId, dimensionIdKey}) => {
  return (ops || []).map(op => {
    const modifiedOp = {...op};

    Object.entries(modifiedOp).forEach(([opKey, op]) => {
      if (opToModifierMap[opKey]) {
        modifiedOp[opKey] = opToModifierMap[opKey]({
          dimensionId,
          dimensionIdKey,
          op,
        });
      }
    });
    return modifiedOp;
  });
};
