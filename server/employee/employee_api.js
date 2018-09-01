const Router = require('express');
const bcrypt = require('bcryptjs');

const router = Router();

const EmployeeController = require('./employee_controller');
const UserController = require('../user/user_controller');

router.post('/  ', async (req, resp) => {
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

module.exports = router;