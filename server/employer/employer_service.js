const dbService = require('../../db_services');

const employerModel = 'employer';
const userModel = 'user';
const employeeModel = 'employee';

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

  async setTokens(empId) {
    const strLen = empId.length;
    const _id = `${empId.substring(1, strLen - 1)}`;
    const tokenNumber = 1500;
    try {
      const filter = {
        _id,
      };
      const query = {
        $set: {
          tokenNumber,
        },
      };
      await dbService.updateOne(employerModel, filter, query);
    } catch (err) {
      logger.error(`Unable to set the tokens for employer ${err.stack}`);
    }
    return tokenNumber;
  },

  async setEmployeeData(employeeData) {
    try {
      await dbService.insertOne(userModel, employeeData);
    } catch (err) {
      logger.error(`Unable to set the employee data ${err.stack}`);
    }
  },

  async addEmployeeData(data) {
    try {
      await dbService.insertOne(employeeModel, data);
    } catch (err) {
      logger.error(`Unable to insert the employee data ${err.stack}`);
    }
  },

  async updateLicense(_id, license) {
    try {
      const filter = {
        _id,
      };
      const query = {
        $set: {
          license,
        },
      };
      await dbService.updateOne(employerModel, filter, query);
    } catch (err) {
      logger.error('Unable to update the license');
    }
  },
};

module.exports = EmployerService;
