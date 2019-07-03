const modifyBulkWriteOperations = require('./modify-bulk-write-operations');

describe('modify-bulk-write-operations', () => {
  it.each([
    ['dimension id present', {dim: 'a'}, {dim: 't'}],
    ['dimension id absent', {}, {dim: 't'}],
  ])('modifies insertOne (%s)', (name, document, expectedDocument) => {
    const ops = [{insertOne: {document}}];
    const result = modifyBulkWriteOperations({
      ops,
      dimensionId: 't',
      dimensionIdKey: 'dim',
    });
    expect(result).toEqual([{insertOne: {document: expectedDocument}}]);
  });

  it.each([
    ['updateOne', 'dimension id in filter present', {dim: 'a'}, {dim: 't'}],
    ['updateOne', 'dimension id in filter absent', {}, {dim: 't'}],
    ['updateMany', 'dimension id in filter present', {dim: 'a'}, {dim: 't'}],
    ['updateMany', 'dimension id in filter absent', {}, {dim: 't'}],
  ])('modifies filter of %s (%s)', (op, name, filter, expectedFilter) => {
    const ops = [{[op]: {filter, update: {}}}];
    const result = modifyBulkWriteOperations({
      ops,
      dimensionId: 't',
      dimensionIdKey: 'dim',
    });
    expect(result).toEqual([{[op]: {filter: expectedFilter, update: {}}}]);
  });

  it.each([
    [
      'updateOne',
      'dimension id in $set',
      {$set: {dim: 'a'}},
      {$set: {dim: 't'}},
    ],
    [
      'updateOne',
      'dimension id in $setOnInsert',
      {$set: {dim: 'a'}},
      {$set: {dim: 't'}},
    ],
    [
      'updateMany',
      'dimension id in $set',
      {$set: {dim: 'a'}},
      {$set: {dim: 't'}},
    ],
    [
      'updateMany',
      'dimension id in $setOnInsert',
      {$set: {dim: 'a'}},
      {$set: {dim: 't'}},
    ],
  ])('modifies update of %s (%s)', (op, name, update, expectedUpdate) => {
    const ops = [{[op]: {filter: {}, update}}];
    const result = modifyBulkWriteOperations({
      ops,
      dimensionId: 't',
      dimensionIdKey: 'dim',
    });
    expect(result).toEqual([
      {[op]: {filter: {dim: 't'}, update: expectedUpdate}},
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
  ])('throws on dimension id modification in %s (%s)', (op, updateOp) => {
    const ops = [{[op]: {filter: {}, update: {[updateOp]: {dim: 1}}}}];
    const fn = () =>
      modifyBulkWriteOperations({ops, dimensionId: 't', dimensionIdKey: 'dim'});
    expect(fn).toThrow();
  });

  it.each([
    ['dimension id present', {dim: 'a'}, {dim: 't'}],
    ['dimension id absent', {}, {dim: 't'}],
  ])('modifies filter of replaceOne (%s)', (name, filter, expectedFilter) => {
    const ops = [{replaceOne: {filter, replacement: {dim: 't'}}}];
    const result = modifyBulkWriteOperations({
      ops,
      dimensionId: 't',
      dimensionIdKey: 'dim',
    });
    expect(result).toEqual([
      {replaceOne: {filter: expectedFilter, replacement: {dim: 't'}}},
    ]);
  });

  it.each([
    ['dimension id present', {dim: 'a'}, {dim: 't'}],
    ['dimension id absent', {}, {dim: 't'}],
  ])(
    'modifies document of replaceOne (%s)',
    (name, replacement, expectedReplacement) => {
      const ops = [{replaceOne: {filter: {dim: 't'}, replacement}}];
      const result = modifyBulkWriteOperations({
        ops,
        dimensionId: 't',
        dimensionIdKey: 'dim',
      });
      expect(result).toEqual([
        {
          replaceOne: {
            filter: {dim: 't'},
            replacement: expectedReplacement,
          },
        },
      ]);
    }
  );

  it.each([
    ['deleteOne', 'dimension id present', {dim: 'a'}, {dim: 't'}],
    ['deleteOne', 'dimension id absent', {}, {dim: 't'}],
    ['deleteMany', 'dimension id present', {dim: 'a'}, {dim: 't'}],
    ['deleteMany', 'dimension id absent', {}, {dim: 't'}],
  ])('modifies filter of %s (%s)', (op, name, filter, expectedFilter) => {
    const ops = [{[op]: {filter}}];
    const result = modifyBulkWriteOperations({
      ops,
      dimensionId: 't',
      dimensionIdKey: 'dim',
    });
    expect(result).toEqual([{[op]: {filter: expectedFilter}}]);
  });
});
