const dbService = require('../../db_services');

const employeeModel = 'employee';
const customerModel = 'customer';

const EmployeeService = {

  async getEmployeeData(userId) {
    let employeeData;
    try {
      const filter = {
        userId,
      };
      employeeData = await dbService.findOne(employeeModel, filter);
    } catch (err) {
      logger.error(`Unable to fetch the employee details ${err.stack}`);
    }
    return employeeData;
  },

  async addCustomerData(data) {
    try {
      await dbService.insertOne(customerModel, data);
    } catch (err) {
      logger.error(`Unable to add the customer data ${err.stack}`);
    }
  },

  async getAllCustomer(employeeId) {
    try {
      const query = {
        employeeId,
      };
      return await dbService.findAll(customerModel, query);
    } catch (err) {
      logger.error(`Unable to fetch all the customer details ${err.stack}`);
      return null;
    }
  },

  async getCustomerDetails(phone) {
    try {
      const query = {
        phone,
      };
      return await dbService.findOne(customerModel, query);
    } catch (err) {
      logger.error(`Unable to fetch the customer details ${err.stack}`);
      return null;
    }
  },

  async updateCustomerDetails(customerData) {
    try {
      const filter = {
        phone: customerData.phone,
      };
      const query = {
        $set: customerData,
      };
      await dbService.update(customerModel, filter, query);
    } catch (err) {
      logger.error(`Unable to update the customer data ${err.stack}`);
    }
  },
};

module.exports = EmployeeService;
