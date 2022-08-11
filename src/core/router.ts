import { INestApplication } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as cookieParser from 'cookie-parser';
import { config } from './config';
import { monoEnum, monoLogger } from 'mono-utils-core';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import { constant } from '.';
import * as moment from 'moment';
import { winstonLogger } from './providers';

export function router(app: INestApplication) {
    app.use(cookieParser());

    app.setGlobalPrefix('/api');
    app.enableCors({ origin: config.CLIENT_URL, credentials: true });

    if (config.NODE_ENV === monoEnum.NODE_ENV_MODE.PRODUCTION) {
        app.use(helmet());
        app.use(compression());
    }

    app.use(
        morgan(function (tokens, req, res) {
            const resStatus = tokens.status(req, res);
            const resTime = tokens['response-time'](req, res);
            const reqMethod = tokens.method(req, res);
            const reqUrl = tokens.url(req, res);
            const reqIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const reqDate = tokens['date'](req, res);

            const content = `${moment(reqDate).format('YYYY-MM-DD HH:mm:ss')} ${reqIp} ${reqMethod} ${reqUrl} ${resStatus} - ${resTime} ms`;
            winstonLogger.info({
                resStatus,
                resTime,
                reqMethod,
                reqUrl,
                reqIp,
                reqDate,
            });
            monoLogger.log(constant.NS.HTTP, content);
        }),
    );

    //handle for multiple language
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT');
        res.header('Access-Control-Allow-Headers', '*');

        next();
    });
}
