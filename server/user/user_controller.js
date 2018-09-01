const UserService = require('./user_service');

const UserController = {
  async checkAndInsertEmployer(data) {
    const response = {};
    const employerData = data;
    employerData.userType = USERTYPE.EMPLOYER;
    try {
      response.id = await UserService.addUser(employerData);
      const employerDataDb = {
        name: employerData.name,
        phone: employerData.phone,
        userId: response.id,
      };
      await UserService.addEmployerData(employerDataDb);
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

  async getUserDetailsId(userId) {
    try {
      return await UserService.getUserDetailsId(userId);
    } catch (err) {
      logger.error(`Unable to get the user details using id ${err.stack}`);
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
