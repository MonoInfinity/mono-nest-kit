import { LoggerService } from '@nestjs/common';
import { monoLogger } from 'mono-utils-core';
import { constant } from '../constant';

export class CustomLoggerService implements LoggerService {
    /**
     * Write a 'log' level log.
     */
    log(message: any, ...optionalParams: any[]) {
        monoLogger.log(constant.NS.APP_INFO, message);
    }

    /**
     * Write an 'error' level log.
     */
    error(message: any, ...optionalParams: any[]) {
        monoLogger.log(constant.NS.APP_ERROR, optionalParams);
    }

    /**
     * Write a 'warn' level log.
     */
    warn(message: any, ...optionalParams: any[]) {
        monoLogger.log(constant.NS.APP_WARN, message);
    }
}
