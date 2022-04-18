import { LoggerService } from '@nestjs/common';
import { monoLogger } from 'mono-utils-core';
import { constant } from '../constant';

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
