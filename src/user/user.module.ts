import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from '../core/repositories';
import { UserController } from './user.controller';
import { UserService } from './user.service';

import { Connection } from 'typeorm';
import { User } from '../core/models';

@Module({
    imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService, { provide: UserRepository, useFactory: (connection: Connection) => connection.getCustomRepository(UserRepository), inject: [Connection] }],
    exports: [UserService, UserRepository],
})
export class UserModule {}
