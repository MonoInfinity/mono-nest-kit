import { Body, Controller, Get, HttpException, Param, Put, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { JoiValidatorPipe } from '../core/pipe/validator.pipe';
import { ChangePasswordDTO, vChangePasswordDTO, UpdateUserDTO, vUpdateUserDTO, vFilterUsersDto, FilterUsersDTO } from './dto';
import { constant } from '../core';
import { QueryJoiValidatorPipe } from '../core/pipe/queryValidator.pipe';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

    @Get('/me')
    @UseGuards(AuthGuard)
    async cGetMe(@Req() req: Request, @Res() res: Response) {
        return res.send(req.user);
    }

    @Get('/:userId')
    async cGetOneById(@Param('userId') userId: string, @Res() res: Response) {
        const user = await this.userService.findOne('id', userId);
        if (!user) throw new HttpException({ errorMessage: 'error.not_found' }, StatusCodes.NOT_FOUND);
        return res.send(user);
    }

    @Put('/password')
    @UseGuards(AuthGuard)
    @UsePipes(new JoiValidatorPipe(vChangePasswordDTO))
    async changePassword(@Body() body: ChangePasswordDTO, @Res() res: Response, @Req() req: Request) {
        //get current user data
        const user = await this.userService.findOne('id', req.user.id);
        //check current input value is correct or not
        const isCorrectPassword = await this.authService.decryptPassword(body.currentPassword, user.password);
        if (!isCorrectPassword) {
            throw new HttpException({ errorMessage: 'error.invalid_current_password' }, StatusCodes.BAD_REQUEST);
        }
        //change password to new password
        user.password = await this.authService.encryptPassword(body.newPassword, constant.default.hashingSalt);
        await this.userService.updateOne(user);
        return res.send();
    }

    @Put('/')
    @UseGuards(AuthGuard)
    @UsePipes(new JoiValidatorPipe(vUpdateUserDTO))
    async updateUserInformation(@Body() body: UpdateUserDTO, @Res() res: Response, @Req() req: Request) {
        //get current user data
        const user = await this.userService.findOne('id', req.user.id);
        // update field
        user.name = body.name;
        await this.userService.updateOne(user);
        return res.send();
    }

    @Get('/search')
    @UsePipes(new QueryJoiValidatorPipe(vFilterUsersDto))
    async filterUsers(@Query() queries: FilterUsersDTO, @Res() res: Response) {
        const { name, page, pageSize, orderBy, order } = queries;

        const result = await this.userService.filterUsers(name, page, pageSize, orderBy, order);

        return res.send(result);
    }
}
