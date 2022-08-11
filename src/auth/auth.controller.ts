import { Body, Controller, Get, HttpException, Param, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { StatusCodes } from 'http-status-codes';
import { LoginDTO, vLoginDTO, RegisterDTO, vRegisterDTO, vRequestVerifyEmailDTO, RequestVerifyEmailDTO } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { constant } from '../core/constant';
import { User } from '../core/models';
import { JoiValidatorPipe } from '../core/pipe/validator.pipe';
import { config } from '../core';
import { JwtToken } from '../core/interface';
import { EmailService } from '../core/providers';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService, private readonly emailService: EmailService) {}

    @Post('/verify-email')
    @UsePipes(new JoiValidatorPipe(vRequestVerifyEmailDTO))
    async cSendVerifyEmail(@Body() body: RequestVerifyEmailDTO, @Res() res: Response) {
        const user = await this.userService.findUser('email', body.email);

        if (!user) {
            throw new HttpException({ errorMessage: 'error.not_found' }, StatusCodes.BAD_REQUEST);
        }

        const otp = await this.authService.createAccessToken(user, 5);

        const isSend = await this.emailService.sendEmailForVerify(user.email, otp);

        if (!isSend) {
            throw new HttpException({ errorMessage: 'error.something_wrong' }, StatusCodes.INTERNAL_SERVER_ERROR);
        }

        return res.send();
    }

    @Get('/verify-email/:otp')
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

        return res.send();
    }

    @Post('/register')
    @ApiOperation({ summary: 'Create new user' })
    @ApiCreatedResponse({ type: String, description: 'access token' })
    @UsePipes(new JoiValidatorPipe(vRegisterDTO))
    async cRegister(@Body() body: RegisterDTO, @Res() res: Response) {
        const user = await this.userService.findUser('email', body.email);
        if (user) throw new HttpException({ email: 'field.field-taken' }, StatusCodes.BAD_REQUEST);

        const newUser = new User();
        newUser.name = body.name;
        newUser.email = body.email;
        newUser.password = await this.authService.encryptPassword(body.password, constant.default.hashingSalt);

        const insertedUser = await this.userService.saveUser(newUser);

        const accessToken = await this.authService.createAccessToken(insertedUser);
        return res.cookie(constant.authController.tokenName, accessToken, { maxAge: constant.authController.registerCookieTime }).send({ token: accessToken });
    }

    @Post('/login')
    @ApiOperation({ summary: 'Login' })
    @ApiCreatedResponse({ type: String, description: 'access token' })
    @UsePipes(new JoiValidatorPipe(vLoginDTO))
    async cLogin(@Body() body: LoginDTO, @Res() res: Response) {
        const user = await this.userService.findUser('email', body.email);
        if (!user) throw new HttpException({ errorMessage: 'error.invalid-password-username' }, StatusCodes.BAD_REQUEST);

        const isCorrectPassword = await this.authService.decryptPassword(body.password, user.password);
        if (!isCorrectPassword) throw new HttpException({ errorMessage: 'error.invalid-password-username' }, StatusCodes.BAD_REQUEST);

        const accessToken = await this.authService.createAccessToken(user);
        return res.cookie(constant.authController.tokenName, accessToken, { maxAge: constant.authController.loginCookieTime }).send({ token: accessToken });
    }

    @Post('/logout')
    @ApiOperation({ summary: 'Logout user account' })
    async cLogout(@Req() req: Request, @Res() res: Response) {
        return res.cookie(constant.authController.tokenName, '', { maxAge: -999 }).send();
    }

    // ---------------------------3rd authentication---------------------------
    @Get('/google')
    @UseGuards(AuthGuard('google'))
    cGoogleAuth() {
        //
    }

    @Get('/google/callback')
    @UseGuards(AuthGuard('google'))
    async cGoogleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        const accessToken = await this.authService.createAccessToken(req.user as User);
        return res.cookie(constant.authController.tokenName, accessToken, { maxAge: constant.authController.googleUserCookieTime }).redirect(config.GOOGLE_CLIENT_REDIRECT_URL);
    }
}
