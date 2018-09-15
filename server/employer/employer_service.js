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

  async getEmployerDataId(employerId) {
    let employeeData;
    try {
      employeeData = await dbService.findOneById(employerModel, employerId);
    } catch (err) {
      logger.error(`Unable to fetch the employer data ${err.stack}`);
    }
    return employeeData;
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

  async updateS3Details(_id, s3Data) {
    try {
      const filter = {
        _id,
      };
      const query = {
        $set: {
          s3Details: s3Data,
        },
      };
      await dbService.updateOne(employerModel, filter, query);
    } catch (err) {
      logger.error('Unable to update the S3 details');
    }
  },

  async decrementToken(employerId) {
    try {
      const filter = {
        _id: employerId,
      };
      const query = {
        $inc: {
          tokenNumber: -1,
        },
      };
      await dbService.updateOne(employerModel, filter, query);
    } catch (err) {
      logger.error(`Unable to decrement the token ${err.stack}`);
    }
  },

  async getAllEmployees(employerId) {
    try {
      const filter = {
        employerId,
      };
      return await dbService.findAll(employeeModel, filter);
    } catch (err) {
      logger.error(`Unable to fetch all the employees ${err.stack}`);
      return null;
    }
  },
};

module.exports = EmployerService;
