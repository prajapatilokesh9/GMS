import winston from 'winston';
import { config } from '../config';

const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'fitcore-backend' },
  transports: [
    new winston.transports.Console({
      format:
        config.nodeEnv === 'development'
          ? winston.format.combine(winston.format.colorize(), winston.format.simple())
          : winston.format.json(),
    }),
  ],
});

export default logger;
