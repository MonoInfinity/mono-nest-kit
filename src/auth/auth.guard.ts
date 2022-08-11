import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../core/models';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../user/user.service';
import { JwtToken } from '../core/interface';
import { constant } from '../core';
import * as _ from 'lodash';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService, private readonly userService: UserService, private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const roles = this.reflector.get<UserRole[]>('roles', context.getHandler()) || [];
        const authorization = _.get(req.headers, `${constant.authHeader}`, '');
        const token = _.get((authorization as string).split(' '), `[1]`, '');

        const { data, error } = await this.authService.verifyToken<JwtToken>(token);
        if (error) {
            throw new HttpException({}, StatusCodes.UNAUTHORIZED);
        }

        const user = await this.userService.findOne('id', data.id);

        if (!user) {
            throw new HttpException({}, StatusCodes.UNAUTHORIZED);
        }

        if (roles.length && !roles.includes(user.role)) {
            throw new HttpException({}, StatusCodes.UNAUTHORIZED);
        }

        user.password = '';
        req.user = user;

        return true;
    }
}
