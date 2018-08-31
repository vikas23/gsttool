const dbService = require('../../db_services');

const employerModel = 'employer';
const userModel = 'user';

const EmployerService = {

  async getEmployerData(userId) {
    let employerData;
    try {
      const query = {
        userId,
      };
      employerData = await dbService.findOne(employerModel, query);
    } catch (err) {
      logger.error(`Unable to fetch the employer data ${err.stack}`);
    }
    return employerData;
  },

  async setTokens(licenseData) {
    try {
      const filter = {
        _id: licenseData._id,
      };
      const query = {
        $set: {
          tokenNumber: licenseData.tokenNumber,
        },
      };
      await dbService.update(employerModel, filter, query);
    } catch (err) {
      logger.error(`Unable to set the tokens for employer ${err.stack}`);
    }
  },

  async setEmployeeData(employeeData) {
    try {
      await dbService.insertOne(userModel, employeeData);
    } catch (err) {
      logger.error(`Unable to set the employee data ${err.stack}`);
    }
  },
};

module.exports = EmployerService;
