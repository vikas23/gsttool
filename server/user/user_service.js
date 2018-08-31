const dbService = require('../../db_services');

const userModel = 'user';
const userSessionModel = 'userSession';

async function getAllExpiredSessionIds() {
  const expiredSessionIds = [];
  try {
    const currentTime = new Date().getTime();
    const query = {
      isActive: true,
    };
    const activeSessions = await dbService.findAll(userSessionModel, query, {
      lastUsedTime: 1,
    });
    _.each(activeSessions, (session) => {
      if (currentTime - session.lastUsedTime > config.tokenExpireTime) expiredSessionIds.push(session._id);
    });
  } catch (e) {
    logger.error('Unable to fetch the sessions');
  }
  return expiredSessionIds;
}

const UserService = {
  async addUser(data) {
    let userId;
    try {
      userId = await dbService.insertOne(userModel, data);
    } catch (err) {
      logger.error(`Failed to create new user ${err.stack}`);
    }
    return userId;
  },

  async getUserDetails(data) {
    try {
      const filter = {
        phone: data.phone,
      };
      return await dbService.findOne(userModel, filter);
    } catch (err) {
      logger.error(`Failed to find the user ${err.stack}`);
      return null;
    }
  },

  async storeSession(data) {
    try {
      await dbService.insertOne(userSessionModel, data);
    } catch (err) {
      logger.error(`Failed to create new session ${err.stack}`);
    }
  },

  async checkAndRemoveExpiredSession() {
    try {
      const sessionIds = await getAllExpiredSessionIds();
      if (sessionIds.length) {
        const filter = {
          _id: {
            $in: sessionIds,
          },
        };
        const query = {
          $set: {
            isActive: false,
          },
        };
        await dbService.update(userSessionModel, filter, query);
      }
    } catch (err) {
      logger.error(`Unable to check the sessions status ${err.stack}`);
    }
  },

  async updateSessionTime(data) {
    try {
      const currentTime = new Date().getTime();
      const filter = {
        isActive: true,
        userId: data.userId,
        token: data.token,
      };
      const query = {
        $set: {
          lastUsedTime: currentTime,
        },
      };
      await dbService.updateOne(userSessionModel, filter, query);
    } catch (err) {
      logger.error(`Unable to update the session ${err.stack}`);
    }
  },

  async changeUserPasword(data) {
    try {
      const filter = {
        _id: data.id,
      };
      const query = {
        $set: {
          password: data.password,
        },
      };
      await dbService.updateOne(userModel, filter, query);
    } catch (err) {
      logger.error(`Unable to update the password of user ${err.stack}`);
    }
  },
};

module.exports = UserService;
