const express = require('express');

const app = express();
const bodyParser = require('body-parser');
// const swaggerUi = require('swagger-ui-express');
const _ = require('lodash'); // eslint-disable-line no-unused-vars
const schedule = require('node-schedule');
const config = require('./config');
const db = require('./config/db');
const router = require('./server/routes');
const routerLogin = require('./server/routes-login');
const logger = require('./config/winston');
const UserService = require('./server/user/user_service');
// const swaggerDocument = require('./config/swagger.json');
const authMw = require('./auth');

const env = process.env.NODE_ENV;

// Make global variables
global._ = _;
global.logger = logger;
global.config = config;
global.USERTYPE = {
  EMPLOYER: 1,
  EMPLOYEE: 2,
  CUSTOMER: 3,
};

app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(bodyParser.json());

if (env === 'dev') {
  // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Credentials', 'true');
  // res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With,X-CustomHeader,X-Auth-Token,X-User-Id,Tenant-Id,X-File-Name,X-File-Size');
  next();
});


app.use('/api/v1', routerLogin);

app.use(authMw);

app.use('/api/v1', router);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  if (err) {
    // add this line to include winston logging
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    // render the error page
    res.status(err.status || 500).send({
      message: err.message,
      error: err,
    });
  }
  next();
});

db.connect(config.MONGOURL, (err) => {
  if (err) {
    logger.error(`Mongodb connection failed !!! ${err.stack}`);
    process.exit(1);
  } else {
    logger.info('MongoDB connected.');
    // require("./db_services/db_init")('testing');
    app.listen(config.PORT, '127.0.0.1', () => {
      logger.info(`Server running at port: ${config.PORT}`);
    });
  }
});

// Check and removed expired sessions

try {
  const j = schedule.scheduleJob('*/30 * * * *', () => {
    UserService.checkAndRemoveExpiredSession();
  });
  if (!j) {
    throw new Error('Unable to schedule the Job');
  }
} catch (err) {
  logger.error(`Unable to schedule the job ${err.stack}`);
}