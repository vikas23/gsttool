const Router = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = Router();
const UserController = require('./user_controller');

router.post('/registeruser', async (req, resp) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;
    const response = await UserController.checkAndInsertUser(req.body);
    const token = jwt.sign({
      id: response.id,
    }, config.defaultKey, {
      expiresIn: config.tokenExpireTime,
    });
    resp.status(200).send({
      auth: true,
      token,
      userId: response.id,
    });
  } catch (err) {
    logger.error(`Unable to add user ${err.stack}`);
    resp.json({
      error: err,
    });
  }
});

router.post('/login', async (req, resp) => {
  try {
    const user = await UserController.getUserDetails(req.body.phone);
    if (!user) return resp.status(404).send('No user found.');

    // check if the password is valid
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return resp.status(401).send({
        auth: false,
        token: null,
      });
    }
    // if user is found and password is valid
    // create a token
    const token = jwt.sign({
      id: user._id,
    }, config.defaultKey, {
      expiresIn: config.tokenExpireTime, // expires in 24 hours
    });
    req.body.token = token;
    await UserController.storeSessionDetails(req.body, token);

    resp.status(200).send({
      auth: true,
      token,
      userId: user._id,
    });
  } catch (err) {
    logger.error(`Unable to logged in the user ${err.stack}`);
    resp.json({
      error: err,
    });
  }
});

// Need to improve this
router.get('/logout', (req, res) => {
  res.status(200).send({
    auth: false,
    token: null,
  });
});

module.exports = router;