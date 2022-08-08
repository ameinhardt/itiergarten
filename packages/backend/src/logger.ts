import * as winston from 'winston';
import 'winston-daily-rotate-file';

const concatArray = winston.format((info, options) => {
    if (Array.isArray(info.message)) {
      info.message = info.message.join(options);
    }
    return info;
  }),
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    silent: process.env.LOG_LEVEL !== 'debug' && process.env.NODE_ENV === 'test',
    defaultMeta: {},
    transports: [
      new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        auditFile: 'logs/audit.json',
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
          winston.format.printf((info) =>
            info.level === 'info'
              ? `[${info.timestamp}] ${info.message}`
              : `[${info.timestamp}] ${info.level}: ${info.message}`
          )
        )
      }),
      new winston.transports.Console({
        format: process.env.LOG_FORMAT === 'json'
          ? winston.format.combine(concatArray(', '), winston.format.timestamp())
          : winston.format.combine(
            concatArray('\n* '),
            winston.format.colorize({ message: true }),
            winston.format.printf(({ message }) => message)
          ),
        stderrLevels: ['error', 'warn']
      })
    ]
  });

export default logger;
