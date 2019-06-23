const modifyBulkWriteOperations = require('./modify-bulk-write-operations');

describe('modify-bulk-write-operations', () => {
  const tenantId = 't';
  const tenantIdKey = 'tenantId';

  it.each([
    ['tenantId present', {[tenantIdKey]: 'a'}, {[tenantIdKey]: 't'}],
    ['tenantId absent', {}, {[tenantIdKey]: 't'}],
  ])('modifies insertOne (%s)', (name, document, expectedDocument) => {
    const ops = [{insertOne: {document}}];
    const result = modifyBulkWriteOperations({ops, tenantId, tenantIdKey});
    expect(result).toEqual([{insertOne: {document: expectedDocument}}]);
  });

  it.each([
    [
      'updateOne',
      'tenantId in filter present',
      {tenantId: 'a'},
      {tenantId: 't'},
    ],
    ['updateOne', 'tenantId in filter absent', {}, {tenantId: 't'}],
    [
      'updateMany',
      'tenantId in filter present',
      {tenantId: 'a'},
      {tenantId: 't'},
    ],
    ['updateMany', 'tenantId in filter absent', {}, {tenantId: 't'}],
  ])('modifies filter of %s (%s)', (op, name, filter, expectedFilter) => {
    const ops = [{[op]: {filter, update: {}}}];
    const result = modifyBulkWriteOperations({ops, tenantId, tenantIdKey});
    expect(result).toEqual([{[op]: {filter: expectedFilter, update: {}}}]);
  });

  it.each([
    [
      'updateOne',
      'tenantId in $set',
      {$set: {tenantId: 'a'}},
      {$set: {tenantId: 't'}},
    ],
    [
      'updateOne',
      'tenantId in $setOnInsert',
      {$set: {tenantId: 'a'}},
      {$set: {tenantId: 't'}},
    ],
    [
      'updateMany',
      'tenantId in $set',
      {$set: {tenantId: 'a'}},
      {$set: {tenantId: 't'}},
    ],
    [
      'updateMany',
      'tenantId in $setOnInsert',
      {$set: {tenantId: 'a'}},
      {$set: {tenantId: 't'}},
    ],
  ])('modifies update of %s (%s)', (op, name, update, expectedUpdate) => {
    const ops = [{[op]: {filter: {}, update}}];
    const result = modifyBulkWriteOperations({ops, tenantId, tenantIdKey});
    expect(result).toEqual([
      {[op]: {filter: {tenantId: 't'}, update: expectedUpdate}},
    ]);
  });

  it.each([
    ['updateOne', '$bit'],
    ['updateOne', '$currentDate'],
    ['updateOne', '$inc'],
    ['updateOne', '$min'],
    ['updateOne', '$max'],
    ['updateOne', '$mul'],
    ['updateOne', '$rename'],
    ['updateOne', '$unset'],
    ['updateMany', '$bit'],
    ['updateMany', '$currentDate'],
    ['updateMany', '$inc'],
    ['updateMany', '$min'],
    ['updateMany', '$max'],
    ['updateMany', '$mul'],
    ['updateMany', '$rename'],
    ['updateMany', '$unset'],
  ])('throws on tenant id modification in %s (%s)', (op, updateOp) => {
    const ops = [{[op]: {filter: {}, update: {[updateOp]: {tenantId: 1}}}}];
    const fn = () => modifyBulkWriteOperations({ops, tenantId, tenantIdKey});
    expect(fn).toThrow();
  });

  it.each([
    ['tenantId present', {tenantId: 'a'}, {tenantId: 't'}],
    ['tenantId absent', {}, {tenantId: 't'}],
  ])('modifies filter of replaceOne (%s)', (name, filter, expectedFilter) => {
    const ops = [{replaceOne: {filter, replacement: {tenantId: 't'}}}];
    const result = modifyBulkWriteOperations({ops, tenantId, tenantIdKey});
    expect(result).toEqual([
      {replaceOne: {filter: expectedFilter, replacement: {tenantId: 't'}}},
    ]);
  });

  it.each([
    ['tenantId present', {tenantId: 'a'}, {tenantId: 't'}],
    ['tenantId absent', {}, {tenantId: 't'}],
  ])(
    'modifies document of replaceOne (%s)',
    (name, replacement, expectedReplacement) => {
      const ops = [{replaceOne: {filter: {tenantId: 't'}, replacement}}];
      const result = modifyBulkWriteOperations({ops, tenantId, tenantIdKey});
      expect(result).toEqual([
        {
          replaceOne: {
            filter: {tenantId: 't'},
            replacement: expectedReplacement,
          },
        },
      ]);
    }
  );

  it.each([
    ['deleteOne', 'tenantId present', {tenantId: 'a'}, {tenantId: 't'}],
    ['deleteOne', 'tenantId absent', {}, {tenantId: 't'}],
    ['deleteMany', 'tenantId present', {tenantId: 'a'}, {tenantId: 't'}],
    ['deleteMany', 'tenantId absent', {}, {tenantId: 't'}],
  ])('modifies filter of %s (%s)', (op, name, filter, expectedFilter) => {
    const ops = [{[op]: {filter}}];
    const result = modifyBulkWriteOperations({ops, tenantId, tenantIdKey});
    expect(result).toEqual([{[op]: {filter: expectedFilter}}]);
  });
});
