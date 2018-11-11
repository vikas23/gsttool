const jwt = require('jsonwebtoken');

const dbService = require('./db_services');
const UserService = require('./server/user/user_service');

const userSessionModel = 'userSession';

async function isUserAuthenticated(headers) {
  let isAuth = false;
  const token = headers['x-auth-token'];
  const userId = headers['x-user-id'];
  if (token && userId) {
    try {
      // verifies secret and checks exp
      jwt.verify(token, config.defaultKey, (err) => {
        if (!err) {
          isAuth = true;
        }
      });
      if (!isAuth) {
        const query = {
          userId: headers['x-used-id'],
          token: headers['x-auth-token'],
          isActive: true,
        };
        const userSession = await dbService.findOne(userSessionModel, query);
        if (userSession) isAuth = true;
      }
      if (isAuth) {
        // Update Last used time
      }
    } catch (err) {
      logger.error(`Invalid headers with error ${err.stack}`);
    }
  }
  return isAuth;
}

async function authMw(req, res, next) {
  const token = req.headers['x-auth-token'];
  const userId = req.headers['x-user-id'];
  let isAuth = false;
  try {
    if (!token) {
      return res.status(401).send({
        auth: false,
        message: 'No token provided.',
      });
    }
    if (!userId) {
      return res.status(401).send({
        auth: false,
        message: 'No user id provided.',
      });
    }
    isAuth = await isUserAuthenticated(req.headers);
    if (isAuth) {
      const data = {
        userId,
        token,
      };
      UserService.updateSessionTime(data);
      next();
    } else {
      return res.status(401).send({
        auth: false,
        message: 'Session Expired. Please re-login again.',
      });
    }
  } catch (err) {
    logger.error(`Unable to get the session info ${err.stack}`);
    return res.status(403).send({
      auth: false,
      message: 'Failed to check token.',
    });
  }
  return isAuth;
}

module.exports = authMw;
