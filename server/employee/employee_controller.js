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

  async getCustomerData(user) {
    try {
      return await EmployeeService.getCustomerData(user._id);
    } catch (err) {
      logger.error(`Unable to fetch the employee details ${err.stack}`);
      return null;
    }
  },

  async getEmployeeDataById(empUserId) {
    try {
      return await EmployeeService.getEmployeeDataById(empUserId);
    } catch (err) {
      logger.error(`Unable to fetch the employee user details ${err.stack}`);
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

  async getCustomerDetailsId(userId) {
    try {
      console.log('Here');
      return await EmployeeService.getCustomerDetailsByUserId(userId);
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

  async getCustomerBillInfo(customerData) {
    try {
      return await EmployeeService.getCustomerBillInfo(customerData);
    } catch (err) {
      logger.error(`Unable to fetch the customer bills ${err.stack}`);
      return null;
    }
  },

  async updateCustomerBillData(customerData) {
    try {
      await EmployeeService.updateCustomerBillData(customerData);
    } catch (err) {
      logger.error(`Unable to update the employee service ${err.stack}`);
    }
  },

  async insertCustomerBillData(customerData) {
    try {
      await EmployeeService.insertCustomerBillData(customerData);
    } catch (err) {
      logger.error(`Unable to insert the new customer bill data ${err.stack}`);
    }
  },
};

module.exports = EmployeeController;
