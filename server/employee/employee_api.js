const Router = require('express');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');

const router = Router();
const s3 = new AWS.S3();

const EmployeeController = require('./employee_controller');
const UserController = require('../user/user_controller');
const EmployerService = require('../employer/employer_service');

// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);

// abstracts function to upload a file returning a promise
async function uploadFile(buffer, name, type, s3Details) {
  const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: s3Details.bucket,
    ContentType: type.mime,
    Key: name,
  };
  return s3.upload(params).promise();
}

router.post('/createCustomer', async (req, resp) => {
  try {
    const user = await UserController.getUserDetails(req.body);
    if (user) {
      return resp.status(404).send({
        userAlreadyExist: true,
      });
    }
    const employeeUserId = req.headers['x-user-id'];
    const employeeUserData = await UserController.getUserDetailsId(employeeUserId);
    if (!employeeUserData) {
      return resp.status(404).send({
        employeeNotExist: true,
      });
    }

    const employeeUser = {
      _id: employeeUserId,
    };
    const employeeData = await EmployeeController.getEmployeeDetails(employeeUser);
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;
    const response = await EmployeeController.addCustomer(req.body, employeeData);
    // Reduce token by one for the employer
    return resp.status(200).send({
      success: true,
      userId: response.id,
    });
  } catch (err) {
    logger.error(`Unable to create customer ${err.stack}`);
    return resp.status(403).send({
      error: err,
    });
  }
});

router.post('/uploadFile', async (req, resp) => {
  try {
    const userId = req.headers['x-user-id'];
    const user = await UserController.getUserDetailsId(userId);
    let employeeData;
    if (user.userType === USERTYPE.CUSTOMER) {
      const customerUser = {
        _id: userId,
      };
      const customerData = await EmployeeController.getCustomerData(customerUser);
      if (!customerData) {
        return resp.status(404).send({
          customerNotExist: true,
        });
      }
      employeeData = await EmployeeController.getEmployeeDataById(customerData.employeeId);
    } else {
      const employeeUser = {
        _id: userId,
      };
      employeeData = await EmployeeController.getEmployeeDetails(employeeUser);
    }

    if (!employeeData) {
      return resp.status(404).send({
        employeeNotExist: true,
      });
    }
    const employerData = await EmployerService.getEmployerDataId(employeeData.employerId);
    if (!employerData) {
      return resp.status(404).send({
        employerNotExist: true,
      });
    }

    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
      const {
        name,
        phone,
        filePrefix,
      } = fields;
      if (error) {
        logger.error(`Unable to parse the form ${error.stack}`);
        return resp.status(404).send({
          formParseFailed: true,
        });
      }
      try {
        const {
          path,
          originalFilename,
        } = files.file[0];
        const buffer = fs.readFileSync(path);
        const type = fileType(buffer);
        const timestamp = Date.now().toString();
        const fileName = `${name[0]}-${phone[0]}/${filePrefix}-${timestamp}-${originalFilename}`;
        const data = await uploadFile(buffer, fileName, type, employerData.s3Details);
        data.filePrefix = filePrefix;
        return resp.status(200).send({
          uploadData: data,
        });
      } catch (err) {
        return resp.status(403).send(err);
      }
    });
  } catch (err) {
    logger.error(`Unable to upload the file to S3 ${err.stack}`);
    return resp.status(403).send({
      error: err,
    });
  }
});

router.get('/getAllCustomer', async (req, resp) => {
  try {
    const employeeUserId = req.headers['x-user-id'];
    const employeeUserData = await UserController.getUserDetailsId(employeeUserId);
    if (!employeeUserData) {
      return resp.status(404).send({
        employeeNotExist: true,
      });
    }
    const employerUser = {
      _id: employeeUserId,
    };
    const employee = await EmployeeController.getEmployeeDetails(employerUser);
    const allCustomer = await EmployeeController.getAllCustomer(employee._id);
    return resp.status(200).send({
      success: true,
      allCustomer,
    });
  } catch (err) {
    logger.error(`Unable to fetch all customer ${err.stack}`);
    return resp.status(403).send({
      error: err,
    });
  }
});

router.put('/updateCustomer', async (req, resp) => {
  try {
    const employeeUserId = req.headers['x-user-id'];
    const employeeUserData = await UserController.getUserDetailsId(employeeUserId);
    if (!employeeUserData) {
      return resp.status(404).send({
        employeeNotExist: true,
      });
    }
    const {
      phone,
    } = req.body;
    const customer = await EmployeeController.getCustomerDetails(phone);
    if (!customer) {
      return resp.status(404).send({
        customerNotExist: true,
      });
    }
    await EmployeeController.updateCustomerDetails(req.body);
    return resp.status(200).send({
      success: true,
    });
  } catch (err) {
    logger.error(`Unable to update all customer ${err.stack}`);
    return resp.status(403).send({
      error: err,
    });
  }
});

router.get('/getCustomerBillData/:phone', async (req, resp) => {
  try {
    const employeeUserId = req.headers['x-user-id'];
    const employeeUserData = await UserController.getUserDetailsId(employeeUserId);
    if (!employeeUserData) {
      return resp.status(404).send({
        employeeNotExist: true,
      });
    }
    const {
      phone,
    } = req.params;
    const customer = await EmployeeController.getCustomerDetails(phone);
    if (!customer) {
      return resp.status(404).send({
        customerNotExist: true,
      });
    }
    const billData = await EmployeeController.getCustomerBillInfo(req.params);
    return resp.status(200).send({
      success: true,
      billData,
    });
  } catch (err) {
    logger.error(`Unable to fetch customer bill info ${err.stack}`);
    return resp.status(403).send({
      error: err,
    });
  }
});

router.post('/updateCustomerBillData', async (req, resp) => {
  try {
    const userId = req.headers['x-user-id'];
    const customer = await EmployeeController.getCustomerDetailsId(userId);
    if (!customer) {
      return resp.status(404).send({
        customerNotExist: true,
      });
    }
    req.body.userId = userId;
    req.body.phone = customer.phone;
    await EmployeeController.insertCustomerBillData(req.body);
    return resp.status(200).send({
      success: true,
    });
  } catch (err) {
    logger.error(`Unable to update the customer bills data ${err.stack}`);
    return resp.status(403).send({
      error: err,
    });
  }
});

module.exports = router;
