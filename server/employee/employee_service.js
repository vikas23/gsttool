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
};

module.exports = EmployeeService;
