const winston = require('winston')
const moment = require('moment')
require('winston-daily-rotate-file')
const conf = require('../config/config.json')
//const { combine, timestamp, printf } = format;

const transports = [
    new winston.transports.DailyRotateFile({
        name: 'logs',
        filename: conf.logdir + 'access%DATE%.log',
        maxSize: '1000k',
        maxFiles: '15d',
        zippedArchive: false
    }),
    new winston.transports.DailyRotateFile({
        level: 'error',
        name: 'logs',
        filename: conf.logdir + 'error%DATE%.log',
        maxSize: '1000k',
        maxFiles: '15d',
        zippedArchive: false
    }),
    new winston.transports.Console({
        colorize: true
    })
]

// const myFormat = printf(({ level, message, timestamp, body }) => {
//     let log = `${timestamp} [${level}] ${message} \n`;
//     log += "Request:" + JSON.stringify(body.request) + "\n"
//     log += "Response:" + JSON.stringify(body.response) + "\n"
//     log += "-".repeat(100)
//     return log;
//     });

const logger = winston.createLogger({
    transports: transports
})


const log = async (service, level, msg) => {
    logger.log({
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSSS'),
        service: service,
        level: level,
        message: msg
    })
}


module.exports = { log }