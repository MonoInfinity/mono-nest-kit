import { Body, Controller, Get, HttpException, Param, Post, Put, Req, Res, UseGuards, UsePipes } from '@nestjs/common';

import { UserService } from './user.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { SendVerifyEmailDTO } from './dto/sendverifyEmail.dto';
import { EmailService } from '../core/services';
import { ChangePasswordDTO, vChangePasswordDTO } from './dto/changePassword.dto';
import { JoiValidatorPipe } from '../core/pipe/validator.pipe';
import { UpdateUserDTO, vUpdateUserDTO } from './dto/updateName.dto';
import { JwtToken } from '../core/interface';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly authService: AuthService, private readonly emailService: EmailService) {}

    @Post('/send-verify-email')
    async cSendVerifyEmail(@Body() body: SendVerifyEmailDTO, @Res() res: Response) {
        const user = await this.userService.findUser('email', body.email);

        if (!user) {
            throw new HttpException({ errorMessage: 'error.not_found' }, StatusCodes.BAD_REQUEST);
        }

        const otp = await this.authService.createAccessToken(user, 5);

        try {
            await this.emailService.sendEmailForVerify(user.email, otp);
        } catch (error) {
            throw new HttpException({ errorMessage: 'error.something_wrong' }, StatusCodes.INTERNAL_SERVER_ERROR);
        }

        return res.send({ message: 'success' });
    }

    @Get('/verify/:otp')
    async cVerifyEmail(@Param('otp') otp: string, @Res() res: Response) {
        const { data, error } = await this.authService.verifyToken<JwtToken>(otp);
        if (error) {
            throw new HttpException({ errorMessage: '' }, StatusCodes.UNAUTHORIZED);
        }

        const user = await this.userService.findUser('id', data.id);
        if (!user) {
            throw new HttpException({ errorMessage: '' }, StatusCodes.UNAUTHORIZED);
        }

        user.isVerified = true;
        await this.userService.saveUser(user);

        return res.send({});
    }

    @Get('/me')
    @UseGuards(AuthGuard)
    async cGetMe(@Req() req: Request, @Res() res: Response) {
        return res.send(req.user);
    }

    @Get('/:userId')
    async cGetOneById(@Param('userId') userId: string, @Res() res: Response) {
        const user = await this.userService.findUser('id', userId);
        if (!user) throw new HttpException({ errorMessage: 'error.not_found' }, StatusCodes.NOT_FOUND);
        return res.send({ data: user });
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
        user.password = await this.authService.encryptPassword(body.newPassword, 10);
        await this.userService.saveUser(user);
        return res.send({ message: 'success' });
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
        return res.send({ message: 'success' });
    }
}
