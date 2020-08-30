const winston = require('winston')

module.exports = {
  setupLogger: () => {
    const logger = winston.createLogger()
    if (process.env.NODE_ENV === 'production') {
      logger.add(new winston.transports.Console({level: process.env.LOGGING_LEVEL || 'silly'}))
    } else {
      logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(
            info => `${info.timestamp} ${info.level}${info.label ? ` [${info.label || ''}]` : ''}: ${info.message}`
          )
        ),
        level: process.env.LOGGING_LEVEL || 'silly'
      }))
    }

    return logger
  },
  generateRandomString: (length, extra = false) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
      (extra ? '_-' : '')

    let result = ''
    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length))

    return result
  },
}
