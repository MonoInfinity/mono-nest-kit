import { INestApplication } from '@nestjs/common';
import { createMock } from 'ts-auto-mock';
import { Request, Response } from 'express';

//---- Helper

//---- Controller
import { AuthController } from '../auth.controller';
import { initTestModule } from '../../core/test/initTest';
import { User } from '../../core/models';
import { config } from '../../core';

//---- Entity

describe('AuthController', () => {
    let app: INestApplication;

    let authController: AuthController;

    let resetDB: any;
    let user: User;
    beforeAll(async () => {
        const { getApp, module, resetDatabase, getFakeUser } = await initTestModule();
        app = getApp;
        user = await getFakeUser();
        resetDB = resetDatabase;

        authController = module.get<AuthController>(AuthController);
    });

    describe('3rd Authentication', () => {
        describe('googleAuth | facebookAuth | githubAuth', () => {
            it('googleAuth', async () => {
                const res = await authController.cGoogleAuth();
                expect(res).toBeUndefined();
            });
        });

        describe('googleAuthRedirect | facebookAuthRedirect | githubAuthRedirect', () => {
            let req: Request;
            let res: Response;

            beforeEach(() => {
                req = createMock<Request>();
                req.user = user;
                res = createMock<Response>();
                res.cookie = jest.fn().mockReturnValue({
                    redirect: (url) => url,
                });
            });

            it('googleAuthRedirect', async () => {
                const output = await authController.cGoogleAuthRedirect(req, res);

                expect(output).toBe(config.GOOGLE_CLIENT_REDIRECT_URL);
            });
        });
    });

    afterAll(async () => {
        await resetDB();
        await app.close();
    });
});
