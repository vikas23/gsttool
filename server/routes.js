const Router = require('express');

const router = Router();

router.use('/', require('./user/user_api'));

module.exports = router;
