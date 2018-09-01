const Router = require('express');

const router = Router();

router.use('/', require('./employer/employer_api'));
router.use('/', require('./employee/employee_api'));

module.exports = router;
