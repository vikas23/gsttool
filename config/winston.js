const path = require('path');
const winston = require('winston');

const {
  format,
} = winston;
const {
  combine,
  timestamp,
  json,
} = format;

const logRoot = process.cwd();
const LOGDIRECTORY = 'log';
const LOGDIRECTORYROOT = path.join(logRoot, LOGDIRECTORY);

const logger = winston.createLogger({
  format: combine(
    timestamp(),
    format.splat(),
    json(),
  ),
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      json: true,
      colorize: true,
      level: 'silly',
    }),
    new winston.transports.File({
      filename: path.join(LOGDIRECTORYROOT, 'gst-tool.log'),
      level: 'silly',
      json: true,
      colorize: true,
      maxsize: 5242880, // 5MB
      timestamp: true,

    }),
  ],
  logstash: true,
  tailable: true,
  handleExceptions: true,
  humanReadableUnhandledException: true,
  exitOnError: false,
});

module.exports = logger;
