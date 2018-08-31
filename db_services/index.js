const db = require('../config/db');
const logger = require('../config/winston');
const util = require('../utils');

const dbName = 'gsttool';

const DBService = {

  async findOne(model, query, options) {
    try {
      return await db.getDB(dbName).collection(model).findOne(query, options);
    } catch (e) {
      logger.error(`Failed to fetch data ${e.stack}`);
      return e;
    }
  },

  async findOneById(model, id, options) {
    const query = {
      _id: id,
    };
    try {
      return await db.getDB(dbName).collection(model).findOne(query, options);
    } catch (e) {
      logger.error(`Failed to fetch data ${e.stack}`);
      return e;
    }
  },

  async findAll(model, query, options) {
    try {
      return await db.getDB(dbName).collection(model).find(query, options).toArray();
    } catch (e) {
      logger.error(`Failed to fetch data ${e.stack}`);
      return e;
    }
  },

  async insertOne(model, doc, options) {
    try {
      const docData = doc;
      docData._id = util.uuid();
      const result = await db.getDB(dbName).collection(model).insertOne(docData, options);
      return result.insertedId;
    } catch (e) {
      logger.error(`Failed to insert data ${e.stack}`);
      return e;
    }
  },

  async updateOne(model, filter, doc, options) {
    try {
      return await db.getDB(dbName).collection(model).updateOne(filter, doc, options);
    } catch (e) {
      logger.error(`Failed to update model ${e.stack}`);
      return e;
    }
  },

  async update(model, filter, doc, options) {
    try {
      return await db.getDB(dbName).collection(model).update(filter, doc, options);
    } catch (e) {
      logger.error(`Failed to update model ${e.stack}`);
      return e;
    }
  },

  async deleteOne(model, filter, options) {
    try {
      return await db.getDB(dbName).collection(model).deleteOne(filter, options);
    } catch (e) {
      logger.error(`Failed to delete model ${e.stack}`);
      return e;
    }
  },

  async deleteMany(model, filter, options) {
    try {
      return await db.getDB(dbName).collection(model).deleteMany(filter, options);
    } catch (e) {
      logger.error(`Failed to delete model ${e.stack}`);
      return e;
    }
  },
};

module.exports = DBService;
