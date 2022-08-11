import { LoggerService } from '@nestjs/common';
import { monoLogger } from 'mono-utils-core';
import { constant } from '../constant';
import * as winston from 'winston';

export class CustomLoggerService implements LoggerService {
    /**
     * Write a 'log' level log.
     */
    log(...optionalParams: any[]) {
        monoLogger.log(constant.NS.APP_INFO, optionalParams);
    }

    /**
     * Write an 'error' level log.
     */
    error(...optionalParams: any[]) {
        monoLogger.log(constant.NS.APP_ERROR, optionalParams);
    }

    /**
     * Write a 'warn' level log.
     */
    warn(...optionalParams: any[]) {
        monoLogger.log(constant.NS.APP_WARN, optionalParams);
    }
}
export const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [new winston.transports.File({ filename: './log/error.log', level: 'error' }), new winston.transports.File({ filename: './log/info.log', level: 'info' })],
});
