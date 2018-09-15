const Router = require('express');

const router = Router();

router.use('/employer', require('./employer/employer_api'));
router.use('/employee', require('./employee/employee_api'));

module.exports = router;
