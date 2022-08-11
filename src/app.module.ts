import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { DbModule } from './module.config';
import { UserModule } from './user/user.module';

@Module({
    imports: [DbModule, UserModule, AuthModule],
})
export class AppModule {}
