import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../core/repositories';
import { AuthModule } from '../auth/auth.module';

import { User } from '../core/models';
import { Connection } from 'typeorm';

@Module({
    imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, { provide: UserRepository, useFactory: (connection: Connection) => connection.getCustomRepository(UserRepository), inject: [Connection] }],
    exports: [UserService, UserRepository],
})
export class UserModule {}
