const Router = require('express');

const router = Router();
const UserController = require('./user_controller');

router.post('/registeruser', async (req, resp) => {
  try {
    const response = await UserController.checkAndInsertUser(req.body);
    resp.json(response);
  } catch (err) {
    logger.error(`Unable to add user ${err.stack}`);
    resp.json({
      error: err,
    });
  }
});

module.exports = router;
