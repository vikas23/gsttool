const UserService = require('../user/user_service');
const EmployeeService = require('../employee/employee_service');

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
};

module.exports = EmployeeController;
