const UserService = require('../user/user_service');
const EmployeeService = require('../employee/employee_service');
const EmployerService = require('../employer/employer_service');

const EmployeeController = {
  async addCustomer(data, employeeData) {
    const customerData = data;
    customerData.isChangePass = false; // For now diabling the change password for Customer.
    customerData.userType = USERTYPE.CUSTOMER;
    const response = {};
    try {
      response.id = await UserService.addUser(customerData);
      const customerDataDb = {
        name: customerData.name,
        phone: customerData.phone,
        userId: response.id,
        employeeId: employeeData._id,
      };
      await EmployeeService.addCustomerData(customerDataDb);
      await EmployerService.decrementToken(employeeData.employerId);
    } catch (err) {
      logger.error(`Unable to create the customer ${err.stack}`);
    }
    return response;
  },

  async getEmployeeDetails(user) {
    try {
      return await EmployeeService.getEmployeeData(user._id);
    } catch (err) {
      logger.error(`Unable to fetch the employee details ${err.stack}`);
      return null;
    }
  },

  async getAllCustomer(employeeId) {
    try {
      return await EmployeeService.getAllCustomer(employeeId);
    } catch (err) {
      logger.error(`Unable to fetch all the customer details ${err.stack}`);
      return null;
    }
  },

  async getCustomerDetails(customerPhone) {
    try {
      return await EmployeeService.getCustomerDetails(customerPhone);
    } catch (err) {
      logger.error(`Unable to fetch the customer details ${err.stack}`);
      return null;
    }
  },

  async updateCustomerDetails(customerData) {
    try {
      return await EmployeeService.updateCustomerDetails(customerData);
    } catch (err) {
      logger.error(`Unable to update all the customer details ${err.stack}`);
      return null;
    }
  },
};

module.exports = EmployeeController;
