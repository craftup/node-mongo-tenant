const {Mongoose, Schema, version: mongooseVersion} = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const plugin = require('./index');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost/mongo-tenant-test';

const sleep = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));
const resetDb = async () => {
  const db = await MongoClient.connect(MONGO_URI);
  const collections = await db.collections();
  await Promise.all(
    collections
      .filter(
        collection => collection.collectionName.startsWith('system.') === false
      )
      .map(collection => collection.drop())
  );
  await db.close();
};

describe('plugin', () => {
  describe('with real connection', () => {
    let mongoose;

    const buildModel = (schemaSpec = {}, options = {}) => {
      const schema = new Schema(schemaSpec);
      schema.plugin(plugin, options);
      const model = mongoose.model('model', schema);
      return {schema, model};
    };

    beforeEach(async () => {
      await resetDb();

      mongoose = new Mongoose();
      if (mongooseVersion < '5.0.0') {
        await mongoose.connect(MONGO_URI, {useMongoClient: true});
      } else {
        await mongoose.connect(MONGO_URI);
      }
    });

    afterEach(async () => {
      await sleep(25);
      await mongoose.disconnect();
    });

    it.each([
      ['default', {}, 'byTenant'],
      ['custom', {accessorMethod: 'by_tenant'}, 'by_tenant'],
    ])('injects accessor method (%s)', (name, options, accessorMethod) => {
      const schema = new Schema({});
      schema.plugin(plugin, options);
      const model = mongoose.model('model', schema);

      expect(model).toHaveProperty(accessorMethod);
      expect(model[accessorMethod]).toBeInstanceOf(Function);
    });

    describe('when applied to a schema witch is used to build a model', () => {
      let schema;
      let model;

      beforeEach(() => {
        schema = new Schema({});
        schema.plugin(plugin);
        model = mongoose.model('model', schema);
      });

      describe('which produces sub models that', () => {
        let modelT1;
        let modelT2;
        beforeEach(() => {
          modelT1 = model.byTenant(1);
          modelT2 = model.byTenant(2);
        });

        it('report having a tenant context', () => {
          expect(modelT1).toHaveProperty('hasTenantContext', true);
        });

        it('report the right tenant id', () => {
          expect(modelT1.getTenantId()).toBe(1);
          expect(modelT2.getTenantId()).toBe(2);
        });

        describe('which when instanciated create documents that', () => {
          let docT1;
          let docT2;
          beforeEach(() => {
            docT1 = new modelT1();
            docT2 = new modelT2();
          });

          it('report having a tenant context', () => {
            expect(docT1).toHaveProperty('hasTenantContext', true);
          });

          it('report the right tenant id', () => {
            expect(docT1.getTenantId()).toBe(1);
            expect(docT2.getTenantId()).toBe(2);
          });
        });
      });
    });

    it('binds Model.aggregate() to tenant context', async () => {
      const {model} = buildModel({num: Number});
      await model.create(
        {tenantId: 'tenant1', num: 10},
        {tenantId: 'tenant1', num: 12},
        {tenantId: 'tenant2', num: 20}
      );

      const results = await model
        .byTenant('tenant1')
        .aggregate({$group: {_id: '$tenantId', sum: {$sum: '$num'}}});

      expect(results).toEqual([{_id: 'tenant1', sum: 22}]);
    });

    it('binds Model.bulkWrite() to tenant context - experimental', async () => {
      const {model} = buildModel({k: Number, v: Number});
      await model.create(
        {tenantId: 'a', k: 1, v: 1},
        {tenantId: 'a', k: 2, v: 1},
        {tenantId: 'a', k: 3, v: 1},
        {tenantId: 'a', k: 4, v: 10},
        {tenantId: 'a', k: 5, v: 10},
        {tenantId: 'a', k: 6, v: 3},
        {tenantId: 'a', k: 7, v: 3},
        {tenantId: 'b', k: 1, v: 1}
      );

      await model.byTenant('a').bulkWrite([
        {
          insertOne: {
            document: {
              k: 8,
              v: 1,
            },
          },
        },
        {
          updateOne: {
            filter: {
              k: 2,
            },
            update: {
              $set: {v: 2},
            },
          },
        },
        {
          updateMany: {
            filter: {
              v: 10,
            },
            update: {
              $set: {v: 20},
            },
          },
        },
        {
          deleteOne: {
            filter: {
              k: 1,
            },
          },
        },
        {
          deleteMany: {
            filter: {
              v: 3,
            },
          },
        },
        {
          replaceOne: {
            filter: {
              k: 3,
            },
            replacement: {
              k: 3,
              v: 2,
            },
          },
        },
      ]);

      const docs = await model.find().sort({tenantId: 1, k: 1});

      const objects = docs.map(doc => doc.toObject());
      expect(objects).toMatchObject([
        {
          tenantId: 'a',
          k: 2,
          v: 2,
        },
        {
          tenantId: 'a',
          k: 3,
          v: 2,
        },
        {
          tenantId: 'a',
          k: 4,
          v: 20,
        },
        {
          tenantId: 'a',
          k: 5,
          v: 20,
        },
        {
          tenantId: 'a',
          k: 8,
          v: 1,
        },
        {
          tenantId: 'b',
          k: 1,
          v: 1,
        },
      ]);
    });

    it('binds Model.count() to tenant context', async () => {
      const {model} = buildModel();
      await model.create({tenantId: 1}, {tenantId: 1}, {tenantId: 2});

      const [t1Count, t2Count] = await Promise.all([
        model.byTenant(1).count(),
        model.byTenant(2).count(),
      ]);

      expect(t1Count).toBe(2);
      expect(t2Count).toBe(1);
    });

    it('binds Model.deleteMany() to tenant context', async () => {
      const {model} = buildModel();
      await model.create({tenantId: 1}, {tenantId: 2});

      await model.byTenant(1).deleteMany({});
      const total = await model.count();

      expect(total).toBe(1);
    });

    it('binds Model.deleteOne() to tenant context', async () => {
      const {model} = buildModel();
      await model.create({tenantId: 'a'}, {tenantId: 'a'}, {tenantId: 'b'});

      await model.byTenant('a').deleteOne({});
      const total = await model.count();

      expect(total).toBe(2);
    });

    it('binds Model.find() to tenant context', async () => {
      const {model} = buildModel();
      await model.create({tenantId: 'a'}, {tenantId: 'a'}, {tenantId: 'b'});

      const docs = await model.byTenant('a').find({});

      expect(docs).toHaveLength(2);
      expect(docs[0]).toHaveProperty('tenantId', 'a');
      expect(docs[1]).toHaveProperty('tenantId', 'a');
    });

    it.skip('binds Model.findById() to tenant context', async () => {});
    if (mongooseVersion >= '5.1.0') {
      it.skip('binds Model.findByIdAndDelete() to tenant context', async () => {});
    }
    it.skip('binds Model.findByIdAndRemove() to tenant context', async () => {});
    it.skip('binds Model.findByIdAndUpdate() to tenant context', async () => {});

    it('binds Model.findOne() to tenant context', async () => {
      const {model} = buildModel();
      await model.create({tenantId: 'a'}, {tenantId: 'a'}, {tenantId: 'b'});

      const doc = await model.byTenant('b').findOne({});

      expect(doc).toHaveProperty('tenantId', 'b');
    });

    if (mongooseVersion >= '5.1.0') {
      it('binds Model.findOneAndDelete() to tenant context', async () => {
        const {model} = buildModel();
        await model.create({tenantId: 'a'}, {tenantId: 'a'}, {tenantId: 'b'});

        await model.byTenant('a').findOneAndDelete({});
        const remainingDocs = await model.find().sort({tenantId: 1});

        const objects = remainingDocs.map(doc => doc.toObject());
        expect(objects).toMatchObject([{tenantId: 'a'}, {tenantId: 'b'}]);
      });
    }

    it('binds Model.findOneAndRemove() to tenant context', async () => {
      const {model} = buildModel();
      await model.create({tenantId: 'a'}, {tenantId: 'a'}, {tenantId: 'b'});

      await model.byTenant('a').findOneAndRemove({});
      const remainingDocs = await model.find().sort({tenantId: 1});

      const objects = remainingDocs.map(doc => doc.toObject());
      expect(objects).toMatchObject([{tenantId: 'a'}, {tenantId: 'b'}]);
    });

    if (mongooseVersion > '5.4.0') {
      it.skip('binds Model.findOneAndReplace() to tenant context', () => {});
    }

    it('binds Model.findOneAndUpdate() to tenant context', async () => {
      const {model} = buildModel({k: Number, v: Number});
      await model.create(
        {tenantId: 'a', k: 1, v: 1},
        {tenantId: 'a', k: 2, v: 1},
        {tenantId: 'b', k: 3, v: 1}
      );

      const originalDoc = await model
        .byTenant('a')
        .findOneAndUpdate({k: 1}, {v: 2});
      const modifiedDoc = await model.findOne({k: 1});

      expect(originalDoc.toObject()).toMatchObject({
        tenantId: 'a',
        k: 1,
        v: 1,
      });
      expect(modifiedDoc.toObject()).toMatchObject({
        tenantId: 'a',
        k: 1,
        v: 2,
      });
    });

    it('binds Model.remove() to tenant context', async () => {
      const {model} = buildModel({t: Number});
      await model.create(
        {tenantId: 'a', t: 1},
        {tenantId: 'a', t: 2},
        {tenantId: 'b', t: 1}
      );

      await model.byTenant('a').remove({t: 1});
      const remainingDocs = await model.find().sort({tenantId: 1});

      const objects = remainingDocs.map(doc => doc.toObject());
      expect(objects).toMatchObject([
        {tenantId: 'a', t: 2},
        {tenantId: 'b', t: 1},
      ]);
    });

    if (mongooseVersion >= '4.9.0') {
      it.skip('binds Model.replaceOne() to tenant context', async () => {});
    }

    it('binds Model.update() to tenant context', async () => {
      const {model} = buildModel({t: Number});
      await model.create({tenantId: 'a', t: 1}, {tenantId: 'b', t: 1});

      await model.byTenant('b').update({t: 2});
      const docs = await model.find();
      const sortedDocs = docs.sort((a, b) =>
        a.tenantId.localeCompare(b.tenantId)
      );

      expect(sortedDocs).toHaveLength(2);
      expect(sortedDocs[0].toObject()).toMatchObject({tenantId: 'a', t: 1});
      expect(sortedDocs[1].toObject()).toMatchObject({tenantId: 'b', t: 2});
    });

    it('binds Model.updateOne() to tenant context', async () => {
      const {model} = buildModel({t: Number});
      await model.create({tenantId: 'a', t: 1}, {tenantId: 'b', t: 1});

      await model.byTenant('b').updateOne({t: 2});
      const docs = await model.find();
      const sortedDocs = docs.sort((a, b) =>
        a.tenantId.localeCompare(b.tenantId)
      );

      expect(sortedDocs).toHaveLength(2);
      expect(sortedDocs[0].toObject()).toMatchObject({tenantId: 'a', t: 1});
      expect(sortedDocs[1].toObject()).toMatchObject({tenantId: 'b', t: 2});
    });

    it('binds Model.updateMany() to tenant context', async () => {
      const {model} = buildModel({t: Number});
      await model.create(
        {tenantId: 'a', t: 1},
        {tenantId: 'a', t: 1},
        {tenantId: 'b', t: 1}
      );

      await model.byTenant('a').updateMany({t: 2});
      const docs = await model.find();
      const sortedDocs = docs.sort((a, b) =>
        a.tenantId.localeCompare(b.tenantId)
      );

      expect(sortedDocs).toHaveLength(3);
      expect(sortedDocs[0].toObject()).toMatchObject({tenantId: 'a', t: 2});
      expect(sortedDocs[1].toObject()).toMatchObject({tenantId: 'a', t: 2});
      expect(sortedDocs[2].toObject()).toMatchObject({tenantId: 'b', t: 1});
    });

    it.skip('protects against override of tenant id in Model.bulkWrite()', async () => {});

    it('protects against override of tenant id in Model.findOneAndUpdate()', async () => {
      const {model} = buildModel({});
      await model.create({tenantId: 'a'});

      await model.byTenant('a').findOneAndUpdate({}, {tenantId: 'b'});

      const docs = await model.find();
      const objects = docs.map(doc => doc.toObject());
      expect(objects).toMatchObject([{tenantId: 'a'}]);
    });

    if (mongooseVersion > '5.4.0') {
      it.skip('binds protects against override of tenant id in Model.findOneAndReplace()', () => {});
    }

    it('protects against override of tenant id in Model.update()', async () => {
      const {model} = buildModel({});
      await model.create({tenantId: 'a'});

      await model.byTenant('a').update({}, {tenantId: 'b'});

      const docs = await model.find();
      const objects = docs.map(doc => doc.toObject());
      expect(objects).toMatchObject([{tenantId: 'a'}]);
    });

    it('protects against override of tenant id in Model.updateOne()', async () => {
      const {model} = buildModel({});
      await model.create({tenantId: 'a'});

      await model.byTenant('a').updateOne({}, {tenantId: 'b'});

      const docs = await model.find();
      const objects = docs.map(doc => doc.toObject());
      expect(objects).toMatchObject([{tenantId: 'a'}]);
    });

    it('protects against override of tenant id in Model.updateMany()', async () => {
      const {model} = buildModel({});
      await model.create({tenantId: 'a'});

      await model.byTenant('a').updateMany({}, {tenantId: 'b'});

      const docs = await model.find();
      const objects = docs.map(doc => doc.toObject());
      expect(objects).toMatchObject([{tenantId: 'a'}]);
    });

    it.skip('inserts tenant id on save of new document', async () => {});
    it.skip('protects against removal of tenant id on save', async () => {});
    it.skip('protects against override of tenant id on save', async () => {});
  });
});
