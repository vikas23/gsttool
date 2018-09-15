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
    const user = await UserController.getUserDetails(req.body);
    if (user) {
      return resp.status(404).send({
        userAlreadyExist: true,
      });
    }
    const employeeUserId = req.headers['x-user-id'];
    const employeeUser = {
      _id: employeeUserId,
    };
    const employeeData = await EmployeeController.getEmployeeDetails(employeeUser);
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
        customerName,
        customerPhone,
      } = fields;
      if (error) throw new Error(error);
      try {
        const {
          path,
          originalFilename,
        } = files.file[0];
        const buffer = fs.readFileSync(path);
        const type = fileType(buffer);
        const timestamp = Date.now().toString();
        const fileName = `${customerName[0]}-${customerPhone[0]}/${timestamp}-${originalFilename}`;
        const data = await uploadFile(buffer, fileName, type, employerData.s3Details);
        return resp.status(200).send(data);
      } catch (err) {
        return resp.status(403).send(err);
      }
    });
  } catch (err) {
    logger.error('Unable to upload the file to S3');
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

module.exports = router;
