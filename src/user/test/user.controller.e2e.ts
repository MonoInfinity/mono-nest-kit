import { AuthService } from './../../auth/auth.service';
import { fakeData, fakeUser } from './../../core/test/helper';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../../core/repositories';
import { UserService } from '../../user/user.service';
import { initTestModule } from '../../core/test/initTest';
import * as supertest from 'supertest';
import { ChangePasswordDTO } from '../dto/changePassword.dto';
import { StatusCodes } from 'http-status-codes';
import { User } from 'src/core/models';
import { UpdateUserDTO } from '../dto';

describe('UserController', () => {
    let app: INestApplication;

    let userService: UserService;
    let userRepository: UserRepository;
    let authService: AuthService;
    beforeAll(async () => {
        const { getApp, module } = await initTestModule();
        app = getApp;

        userRepository = module.get<UserRepository>(UserRepository);

        authService = module.get<AuthService>(AuthService);

        userService = module.get<UserService>(UserService);
    });

    describe('Put User', () => {
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

            it('Fail (Invalid token)', async () => {
                const res = await reqApi(changePasswordData, '');
                expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
            });

            it('Fail (Invalid currentPassword)', async () => {
                changePasswordData.currentPassword = fakeData(9, 'letters');
                const res = await reqApi(changePasswordData, token);
                expect(res.status).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        describe('Update User', () => {
            let getUser: User;
            let newData: UpdateUserDTO;
            const reqApi = (input: UpdateUserDTO, token: string) =>
                supertest(app.getHttpServer())
                    .put('/api/user')
                    .set({ authorization: `Bearer ${token}` })
                    .send(input);
            let token;
            beforeEach(async () => {
                getUser = fakeUser();
                newData = { name: fakeUser().name };
                await userService.saveUser(getUser);
                token = await authService.createAccessToken(getUser);
            });

            it('Pass', async () => {
                const res = await reqApi(newData, token);
                expect(res.status).toBe(StatusCodes.OK);
            });

            it('Fail (Invalid token)', async () => {
                const res = await reqApi(newData, '');
                expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
            });

            it('Fail (invalid joi validator)', async () => {
                const invalidNewData = newData;
                invalidNewData.name = fakeData(4, 'letters');
                const res = await reqApi(invalidNewData, token);
                expect(res.status).toBe(StatusCodes.BAD_REQUEST);
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
                expect(res.body.username).toBe(getUser.username);
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
