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

  async storeSessionDetails(reqBody) {
    try {
      const data = {
        phone: reqBody.phone,
        token: reqBody.token,
        isActive: true,
        lastUsedTime: new Date().getTime(),
      };
      await UserService.storeSession(data);
    } catch (err) {
      logger.error(`Unable to store user session details ${err.stack}`);
    }
  },

  async getUserDetails(reqBody) {
    try {
      return await UserService.getUserDetails(reqBody);
    } catch (err) {
      logger.error(`Unable to get the user details ${err.stack}`);
      return null;
    }
  },

  async changePasword(reqBody) {
    try {
      await UserService.changeUserPasword(reqBody);
    } catch (err) {
      logger.error(`Unable to change the user password ${err.stack}`);
    }
  },
};

module.exports = UserController;
