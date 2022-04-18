import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../core/repositories';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { EmailModule } from '../core/providers';

@Module({
    imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([UserRepository])],
    controllers: [UserController, UsersController],
    providers: [UserService],
    exports: [UserService, TypeOrmModule],
})
export class UserModule {}
