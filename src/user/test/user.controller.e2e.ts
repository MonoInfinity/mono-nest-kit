import { AuthService } from './../../auth/auth.service';
import { fakeData, fakeUser } from './../../core/test/helper';
import { HttpCode, INestApplication } from '@nestjs/common';
import { UserRepository } from '../../core/repositories';
import { UserService } from '../../user/user.service';
import { initTestModule } from '../../core/test/initTest';
import * as supertest from 'supertest';
import { ChangePasswordDTO } from '../dto/changePassword.dto';
import { StatusCodes } from 'http-status-codes';
import { User } from 'src/core/models';
import { RequestVerifyEmailDTO, UpdateUserDTO } from '../dto';

describe('UserController', () => {
    let app: INestApplication;

    let userService: UserService;
    let userRepository: UserRepository;
    let authService: AuthService;
    let resetDb: () => Promise<void>;
    beforeAll(async () => {
        const { getApp, module, resetDatabase } = await initTestModule();
        app = getApp;
        resetDb = resetDatabase;
        userRepository = module.get<UserRepository>(UserRepository);

        authService = module.get<AuthService>(AuthService);

        userService = module.get<UserService>(UserService);
    });

    describe('Post User', () => {
        describe('POST /verify-email', () => {
            const reqApi = (input: RequestVerifyEmailDTO) => supertest(app.getHttpServer()).post('/api/user/verify-email').send(input);
            let user: User;
            beforeEach(async () => {
                user = fakeUser();
                user.isVerified = false;
                await userService.saveUser(user);
            });

            it('Pass', async () => {
                const res = await reqApi({ email: user.email });
                expect(res.status).toBe(StatusCodes.CREATED);
            });
            it('Failed email not found', async () => {
                user.email = 'hello@gmail.com';

                const res = await reqApi({ email: user.email });
                expect(res.status).toBe(StatusCodes.BAD_REQUEST);
            });
        });
    });

    describe('Put User', () => {
        describe('PUT /', () => {
            let updateUser: UpdateUserDTO;
            let token;
            const reqApi = (input: UpdateUserDTO, token: string) =>
                supertest(app.getHttpServer())
                    .put('/api/user')
                    .set({ authorization: `Bearer ${token}` })
                    .send(input);
            beforeEach(async () => {
                const getUser = fakeUser();
                updateUser = {
                    name: fakeData(10, 'lettersAndNumbersLowerCase'),
                };
                await userService.saveUser(getUser);
                token = await authService.createAccessToken(getUser);
            });

            it('Pass', async () => {
                const res = await reqApi(updateUser, token);
                expect(res.status).toBe(StatusCodes.OK);
            });
        });

        describe('PUT /password', () => {
            let changePasswordData: ChangePasswordDTO;
            const reqApi = (input: ChangePasswordDTO, token: string) =>
                supertest(app.getHttpServer())
                    .put('/api/user/password')
                    .set({ authorization: `Bearer ${token}` })
                    .send(input);
            let token: string;
            beforeEach(async () => {
                const getUser = fakeUser();
                changePasswordData = {
                    currentPassword: getUser.password,
                    newPassword: getUser.password,
                    confirmNewPassword: getUser.password,
                };
                getUser.password = await authService.encryptPassword(getUser.password, 2);
                await userService.saveUser(getUser);
                token = await authService.createAccessToken(getUser);
            });

            it('Pass', async () => {
                const res = await reqApi(changePasswordData, token);
                expect(res.status).toBe(StatusCodes.OK);
            });

            it('Failed (Invalid token)', async () => {
                const res = await reqApi(changePasswordData, '');
                expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
            });

            it('Failed (Invalid currentPassword)', async () => {
                changePasswordData.currentPassword = fakeData(9, 'letters');
                const res = await reqApi(changePasswordData, token);
                expect(res.status).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        describe('Update User', () => {
            let getUser: User;
            let newData: UpdateUserDTO;
            let token;
            const reqApi = (input: UpdateUserDTO, token: string) =>
                supertest(app.getHttpServer())
                    .put('/api/user')
                    .set({ authorization: `Bearer ${token}` })
                    .send(input);

            const userReqApi = (token: string) =>
                supertest(app.getHttpServer())
                    .get('/api/user/me')
                    .set({ authorization: `Bearer ${token}` });

            beforeEach(async () => {
                getUser = fakeUser();
                newData = { name: fakeUser().name };

                await userService.saveUser(getUser);
                token = await authService.createAccessToken(getUser);
            });

            it('Pass', async () => {
                const res = await reqApi(newData, token);
                const userInfoRes = await userReqApi(token);

                expect(res.status).toBe(StatusCodes.OK);
                expect(userInfoRes.body).toBeDefined();
                expect(userInfoRes.body.name).toBe(newData.name);
            });
        });
    });

    describe('Get User', () => {
        describe('Get /me', () => {
            let getUser: User;
            const reqApi = (token: string) =>
                supertest(app.getHttpServer())
                    .get('/api/user/me')
                    .set({ authorization: `Bearer ${token}` });
            let token;
            beforeEach(async () => {
                getUser = fakeUser();
                await userService.saveUser(getUser);
                token = await authService.createAccessToken(getUser);
            });

            it('Pass', async () => {
                const res = await reqApi(token);
                expect(res.body).toBeDefined();
                expect(res.body.email).toBe(getUser.email);
            });
            it('Failed user not login', async () => {
                const res = await reqApi('');
                expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
                expect(res.body.username).toBeUndefined();
            });
        });
    });

    afterAll(async () => {
        await resetDb();
        await app.close();
    });
});
