const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const EmployerService = require('./employer_service');
const UserService = require('../user/user_service');

const publicKeyPath = './keys/public_key.pem';
const privateKeyPath = './keys/private_key.pem';

async function encryptStringWithRsaPublicKey(toEncrypt) {
  const absolutePath = path.resolve(publicKeyPath);
  const publicKey = fs.readFileSync(absolutePath, 'utf8');
  const buffer = Buffer.from(toEncrypt);
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
}

async function decryptStringWithRsaPrivateKey(toDecrypt) {
  const absolutePath = path.resolve(privateKeyPath);
  const privateKey = fs.readFileSync(absolutePath, 'utf8');
  const buffer = Buffer.from(toDecrypt, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf8');
}

const EmployerController = {

  async checkAndGenerateLicense(data) {
    let license;
    try {
      const employerInfo = await EmployerService.getEmployerData(data.id);
      if (!employerInfo) {
        throw new Error('No employer found');
      } else {
        const empStr = JSON.stringify(employerInfo._id);
        license = await encryptStringWithRsaPublicKey(empStr);
        await EmployerService.updateLicense(employerInfo._id, license);
      }
    } catch (err) {
      logger.error(`Unable to generate license ${err.stack}`);
    }
    return license;
  },

  async setLicense(data) {
    const {
      license,
    } = data;
    let tokens;
    try {
      const employerInfo = EmployerService.getEmployerData(data.id);
      if (!employerInfo) {
        throw new Error('No employer found');
      } else {
        const licenseStr = await decryptStringWithRsaPrivateKey(license);
        tokens = await EmployerService.setTokens(licenseStr);
      }
    } catch (err) {
      logger.error(`Unable to set the license ${err.stack}`);
    }
    return tokens;
  },

  async createEmployee(data, employerData) {
    const employeeData = data;
    employeeData.isChangePass = true;
    employeeData.userType = USERTYPE.EMPLOYEE;
    const response = {};
    try {
      response.id = await UserService.addUser(employeeData);
      const employeeDataDB = {
        name: employeeData.name,
        phone: employeeData.phone,
        userId: response.id,
        employerId: employerData._id,
      };
      await EmployerService.addEmployeeData(employeeDataDB);
    } catch (err) {
      logger.error(`Unable to create the employee ${err.stack}`);
    }
    return response;
  },

  async getEmployerDetails(user) {
    const userId = user._id;
    try {
      return await EmployerService.getEmployerData(userId);
    } catch (err) {
      logger.error(`Unable to fetch the employer details ${err.stack}`);
      return {};
    }
  },
};

module.exports = EmployerController;
