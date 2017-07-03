/* -------------------------------------------------------
    LOGGER
-------------------------------------------------------- */

const winston = require('winston');

const winston_logger = new winston.Logger({
    transports: [
        new winston.transports.File({ filename: '/var/log/drizzle.log' })
    ]
});

module.exports = {
    info(message) {
        if (process.env.NODE_ENV === 'production') {
            winston_logger.info(message);
        }
        else {
            console.log(message);
        }
    },
    error(message) {
        if (process.env.NODE_ENV === 'production') {
            winston_logger.error(message);
        }
        else {
            console.error(message);
        }
    }
};
