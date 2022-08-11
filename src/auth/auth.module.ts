import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { GoogleStrategy } from './passport/google.strategy';
import { config } from '../core';
import { EmailModule } from '../core/providers';

@Module({
    imports: [forwardRef(() => UserModule), EmailModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        GoogleStrategy,

        {
            provide: JwtService,
            useFactory: () => {
                return new JwtService({ secret: config.JWT_SECRET_KEY });
            },
        },
    ],
    exports: [AuthService],
})
export class AuthModule {}
