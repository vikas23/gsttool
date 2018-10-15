const dbService = require('../../db_services');

const employeeModel = 'employee';
const customerModel = 'customer';
const customerBillsModel = 'customerBills';

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

  async getEmployeeDataById(empId) {
    let employeeData;
    try {
      employeeData = await dbService.findOneById(employeeModel, empId);
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

  async getCustomerBillInfo(customerData) {
    try {
      const query = {
        phone: customerData.phone,
      };
      return await dbService.findAll(customerBillsModel, query);
    } catch (err) {
      logger.error(`Unable to fetch customer bill data ${err.stack}`);
      return null;
    }
  },
  async updateCustomerBillData(customerData) {
    try {
      const filter = {
        userId: customerData.userId,
      };
      const query = {
        $set: {
          billData: customerData.billData,
        },
      };
      await dbService.updateOne(customerBillsModel, filter, query);
    } catch (err) {
      logger.error(`Unable to update the customer data ${err.stack}`);
    }
  },
  async insertCustomerBillData(customerData) {
    try {
      await dbService.insertOne(customerBillsModel, customerData);
    } catch (err) {
      logger.error(`Unable to insert the bill data ${err.stack}`);
    }
  },
  async getCustomerData(userId) {
    let customerData;
    try {
      const filter = {
        userId,
      };
      customerData = await dbService.findOne(customerModel, filter);
    } catch (err) {
      logger.error(`Unable to fetch the employee details ${err.stack}`);
    }
    return customerData;
  },
  async getCustomerDetailsByUserId(userId) {
    let customerData;
    try {
      const filter = {
        userId,
      };
      console.log(filter);
      customerData = await dbService.findOne(customerModel, filter);
    } catch (err) {
      logger.error(`Unable to fetch the customer details ${err.stack}`);
    }
    return customerData;
  },
};

module.exports = EmployeeService;
