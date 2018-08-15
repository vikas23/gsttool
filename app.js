const express = require('express');

const app = express();
const bodyParser = require('body-parser');
// const swaggerUi = require('swagger-ui-express');
const _ = require('lodash'); // eslint-disable-line no-unused-vars
const {
  PORT,
  MONGOURL,
} = require('./config');
const db = require('./config/db');
const router = require('./server/routes');
const logger = require('./config/winston');
// const swaggerDocument = require('./config/swagger.json');

const env = process.env.NODE_ENV;

// Make global variables
global._ = _;
global.logger = logger;

app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(bodyParser.json());

if (env === 'dev') {
  // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use('', router);

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

db.connect(MONGOURL, (err) => {
  if (err) {
    logger.error(`Mongodb connection failed !!! ${err.stack}`);
    process.exit(1);
  } else {
    logger.info('MongoDB connected.');
    // require("./db_services/db_init")('testing');
    app.listen(PORT, '127.0.0.1', () => {
      logger.info(`Server running at port: ${PORT}`);
    });
  }
});
