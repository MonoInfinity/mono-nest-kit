import { Body, Controller, Get, HttpException, Param, Put, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { JoiValidatorPipe } from '../core/pipe/validator.pipe';
import { ChangePasswordDTO, vChangePasswordDTO, UpdateUserDTO, vUpdateUserDTO } from './dto';
import { constant } from '../core';

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
        const user = await this.userService.findUser('id', userId);
        if (!user) throw new HttpException({ errorMessage: 'error.not_found' }, StatusCodes.NOT_FOUND);
        return res.send(user);
    }

    @Put('/password')
    @UseGuards(AuthGuard)
    @UsePipes(new JoiValidatorPipe(vChangePasswordDTO))
    async changePassword(@Body() body: ChangePasswordDTO, @Res() res: Response, @Req() req: Request) {
        //get current user data
        const user = await this.userService.findUser('id', req.user.id);
        //check current input value is correct or not
        const isCorrectPassword = await this.authService.decryptPassword(body.currentPassword, user.password);
        if (!isCorrectPassword) {
            throw new HttpException({ errorMessage: 'error.invalid_current_password' }, StatusCodes.BAD_REQUEST);
        }
        //change password to new password
        user.password = await this.authService.encryptPassword(body.newPassword, constant.default.hashingSalt);
        await this.userService.saveUser(user);
        return res.send();
    }

    @Put('/')
    @UseGuards(AuthGuard)
    @UsePipes(new JoiValidatorPipe(vUpdateUserDTO))
    async updateUserInformation(@Body() body: UpdateUserDTO, @Res() res: Response, @Req() req: Request) {
        //get current user data
        const user = await this.userService.findUser('id', req.user.id);
        // update field
        user.name = body.name;
        await this.userService.saveUser(user);
        return res.send();
    }
}
