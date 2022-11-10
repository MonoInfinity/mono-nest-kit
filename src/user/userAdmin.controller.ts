import { Body, Controller, Get, HttpException, Param, Put, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { constant } from '../core';
import { QueryJoiValidatorPipe } from '../core/pipe/queryValidator.pipe';
import { JoiValidatorPipe } from '../core/pipe/validator.pipe';
import {
    ChangePasswordDTO,
    FilterUsersDTO,
    UpdateUserDTO,
    vChangePasswordDTO,
    vFilterUsersDto,
    vUpdateUserDTO,
} from './dto';
import { FilterAdminUsers } from './dto/filterUsersForAdmin';
import { UserService } from './user.service';

@ApiTags('User Admin')
@ApiBearerAuth()
@Controller(UserAdminController.endPoint)
export class UserAdminController {
    static endPoint = '/api/v1.0/admin/users';

    constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

    @Get('')
    @UseGuards(AuthGuard)
    @UsePipes(new QueryJoiValidatorPipe(FilterAdminUsers.validate))
    async cGetAll(@Query() query: FilterAdminUsers, @Res() res: Response) {
        const users = await this.userService.findManyUsersWithPagination(query);

        return res.send(users);
    }
}
