const UserService = require('./user_service');

const UserController = {
  async checkAndInsertUser(data) {
    const response = {};
    try {
      response.id = await UserService.addUser(data);
    } catch (err) {
      response.error = 'Unable to add user';
      logger.error(`Unable to add user ${err.stack}`);
    }
    return response;
  },

  async storeSessionDetails(reqBody, token) {

    try {
      await UserService.storeSession(reqBody, token);
    } catch (err) {
      logger.error(`Unable to store user session details ${err.stack}`);
    }
  },
};

module.exports = UserController;