const Router = require('express');

const router = Router();

const EmployerController = require('./employer_controller');
const UserController = require('../user/user_controller');

router.post('/set/license', async (req, resp) => {
  try {
    await EmployerController.setLicense(resp.body);
  } catch (err) {
    logger.error(`Unable to set the new license key ${err.stack}`);
  }
});

router.post('/generate/license', async (req, resp) => {
  try {
    const license = await EmployerController.checkAndGenerateLicense(req.body);
    if (license) {
      resp.status(200).send({
        licenseKey: license,
      });
    }
  } catch (err) {
    logger.error(`Unable to generate license key ${err.stack}`);
  }
});

router.post('/createEmployee', async (req, resp) => {
  try {
    const user = await UserController.getUserDetails(req.body.phone);
    if (user) {
      return resp.status(404).send({
        userAlreadyExist: true,
      });
    }
    await EmployerController.createEmployee(resp.body);
    return resp.status(200).send({
      success: true,
    });
  } catch (err) {
    logger.error(`Unable to create employee ${err.stack}`);
    return resp.status(403).send({
      error: err,
    });
  }
});

module.exports = router;
