const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const EmployerService = require('./employer_service');

const publicKeyPath = '../../keys/public_key.pem';
const privateKeyPath = '../../keys/private_key.pem';

async function encryptStringWithRsaPublicKey(toEncrypt) {
  const absolutePath = path.resolve(publicKeyPath);
  const publicKey = fs.readFileSync(absolutePath, 'utf8');
  const buffer = Buffer.from(toEncrypt, 'base64');
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
      const employerInfo = EmployerService.getEmployerData(data.id);
      if (!employerInfo || !employerInfo.tokenNumber) {
        throw new Error('No employer found');
      } else {
        const empStr = JSON.stringify(employerInfo);
        license = encryptStringWithRsaPublicKey(empStr);
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
    try {
      const employerInfo = EmployerService.getEmployerData(data.id);
      if (!employerInfo || !employerInfo.tokenNumber) {
        throw new Error('No employer found');
      } else {
        const licenseStr = decryptStringWithRsaPrivateKey(license);
        const licenseData = JSON.parse(licenseStr);
        await EmployerService.setTokens(licenseData);
      }
    } catch (err) {
      logger.error(`Unable to set the license ${err.stack}`);
    }
  },

  async createEmployee(data) {
    const employeeData = data;
    employeeData.isChangePass = true;
    try {
      await EmployerService.setEmployeeData(employeeData);
    } catch (err) {
      logger.error(`Unable to create the employee ${err.stack}`);
    }
  },
};

module.exports = EmployerController;
