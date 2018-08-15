const dbService = require('../../db_services');

const userModel = 'user';

const UserService = {
  async addUser(data) {
    let userId;
    try {
      userId = await dbService.insertOne(userModel, data);
    } catch (err) {
      logger.error(`Failed to create new user ${err.stack}`);
    }
    return userId;
  },
};

module.exports = UserService;
