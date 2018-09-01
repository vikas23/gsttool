const Router = require('express');
const bcrypt = require('bcryptjs');

const router = Router();

const EmployerController = require('./employer_controller');
const UserController = require('../user/user_controller');

router.post('/set/license', async (req, resp) => {
  try {
    const tokens = await EmployerController.setLicense(req.body);
    resp.status(200).send({
      success: true,
      tokens,
    });
  } catch (err) {
    logger.error(`Unable to set the new license key ${err.stack}`);
    resp.status(403).send({
      error: err,
    });
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
    const user = await UserController.getUserDetails(req.body);
    if (user) {
      return resp.status(404).send({
        userAlreadyExist: true,
      });
    }
    const employerUserId = req.headers['x-user-id'];
    const employerUserData = await UserController.getUserDetailsId(employerUserId);
    if (!employerUserData) {
      return resp.status(404).send({
        employerNotExist: true,
      });
    }
    const employerUser = {
      _id: employerUserId,
    };
    const employerData = await EmployerController.getEmployerDetails(employerUser);

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;
    const response = await EmployerController.createEmployee(req.body, employerData);
    return resp.status(200).send({
      success: true,
      userId: response.id,
    });
  } catch (err) {
    logger.error(`Unable to create employee ${err.stack}`);
    return resp.status(403).send({
      error: err,
    });
  }
});

module.exports = router;
