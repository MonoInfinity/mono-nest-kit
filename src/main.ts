import * as dotenv from 'dotenv';
dotenv.config({
    path: `config/.env.${process.env.NODE_ENV}`,
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { monoLogger } from 'mono-utils-core';
import { config, constant, router } from './core';
import { CustomLoggerService } from './core/providers';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: new CustomLoggerService() });

    router(app);

    await app.listen(config.PORT, () => {
        monoLogger.log(constant.NS.APP_INFO, `Current Mode: ${config.NODE_ENV}`);
        monoLogger.log(constant.NS.APP_INFO, `Listening on port ${config.PORT}`);
        monoLogger.log(constant.NS.APP_INFO, `Ready to service`);
    });
}

monoLogger.log(constant.NS.APP_INFO, `---------------Configuration--------------------`);
monoLogger.log(constant.NS.APP_INFO, config);
monoLogger.log(constant.NS.APP_INFO, `-----------------------------------`);

bootstrap();
