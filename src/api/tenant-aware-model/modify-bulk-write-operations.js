const patchDocument = ({document, tenantId, tenantIdKey}) => ({
  ...document,
  [tenantIdKey]: tenantId,
});

const patchFilter = ({filter, tenantId, tenantIdKey}) => ({
  ...(filter || {}),
  [tenantIdKey]: tenantId,
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
const patchUpdate = ({update, tenantId, tenantIdKey}) => {
  const forbiddenOpsUsed = Object.entries(update).reduce(
    (ops, [op, fields]) => {
      if (
        forbiddenUpdateOperations.includes(op) &&
        Object.keys(fields).includes(tenantIdKey)
      ) {
        ops.push(op);
      }
      return ops;
    },
    []
  );
  if (forbiddenOpsUsed.length > 0) {
    throw new Error(
      `Modification of ${tenantIdKey} via bulkInsert update (${forbiddenOpsUsed.join(
        ', '
      )}`
    );
  }

  const patchedUpdate = {...update};
  patchableUpdateOperations.forEach(op => {
    if (
      patchedUpdate[op] &&
      Object.keys(patchedUpdate[op]).includes(tenantIdKey)
    ) {
      patchedUpdate[op][tenantIdKey] = tenantId;
    }
  });

  return patchedUpdate;
};

const modifyInsert = ({tenantId, tenantIdKey, op: {document, ...rest}}) => ({
  document: patchDocument({document, tenantId, tenantIdKey}),
  ...rest,
});

const modifyUpdate = ({
  tenantId,
  tenantIdKey,
  op: {filter, update, ...rest},
}) => ({
  filter: patchFilter({filter, tenantId, tenantIdKey}),
  update: patchUpdate({update, tenantId, tenantIdKey}),
  ...rest,
});

const modifyReplace = ({
  tenantId,
  tenantIdKey,
  op: {filter, replacement, ...rest},
}) => ({
  filter: patchFilter({filter, tenantId, tenantIdKey}),
  replacement: patchDocument({document: replacement, tenantId, tenantIdKey}),
  ...rest,
});

const modifyDelete = ({tenantId, tenantIdKey, op: {filter, ...rest}}) => ({
  filter: patchFilter({filter, tenantId, tenantIdKey}),
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

module.exports = ({ops, tenantId, tenantIdKey}) => {
  return (ops || []).map(op => {
    const modifiedOp = {...op};

    Object.entries(modifiedOp).forEach(([opKey, op]) => {
      if (opToModifierMap[opKey]) {
        modifiedOp[opKey] = opToModifierMap[opKey]({
          tenantId,
          tenantIdKey,
          op,
        });
      }
    });
    return modifiedOp;
  });
};
