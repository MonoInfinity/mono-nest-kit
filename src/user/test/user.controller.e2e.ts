import { INestApplication } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { User } from 'src/core/models';
import * as supertest from 'supertest';
import { initTestModule } from '../../core/test/initTest';
import { UserService } from '../../user/user.service';
import { UpdateUserDTO } from '../dto';
import { ChangePasswordDTO } from '../dto/changePassword.dto';
import { AuthService } from './../../auth/auth.service';
import { fakeData, fakeUser } from './../../core/test/helper';
import { UserController } from './../user.controller';

describe('UserController', () => {
    let app: INestApplication;

    let userService: UserService;

    let authService: AuthService;

    let resetDb: () => Promise<void>;
    beforeAll(async () => {
        const { getApp, module, resetDatabase } = await initTestModule();
        app = getApp;
        resetDb = resetDatabase;

        authService = module.get<AuthService>(AuthService);

        userService = module.get<UserService>(UserService);
    });

    describe('Put User', () => {
        describe('PUT /', () => {
            let updateUser: UpdateUserDTO;
            let token;
            const reqApi = (input: UpdateUserDTO, token: string) =>
                supertest(app.getHttpServer())
                    .put(UserController.endPoint)
                    .set({ authorization: `Bearer ${token}` })
                    .send(input);
            beforeEach(async () => {
                const getUser = fakeUser();
                updateUser = {
                    name: fakeData(10, 'lettersAndNumbersLowerCase'),
                };
                await userService.updateOne(getUser);
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
                    .put(`${UserController.endPoint}/password`)
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
                await userService.updateOne(getUser);
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

        describe('PUT /user', () => {
            let getUser: User;
            let newData: UpdateUserDTO;
            let token;
            const reqApi = (input: UpdateUserDTO, token: string) =>
                supertest(app.getHttpServer())
                    .put(UserController.endPoint)
                    .set({ authorization: `Bearer ${token}` })
                    .send(input);

            const userReqApi = (token: string) =>
                supertest(app.getHttpServer())
                    .get(`${UserController.endPoint}/me`)
                    .set({ authorization: `Bearer ${token}` });

            beforeEach(async () => {
                getUser = fakeUser();
                newData = { name: fakeUser().name };

                await userService.updateOne(getUser);
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
                    .get(`${UserController.endPoint}/me`)
                    .set({ authorization: `Bearer ${token}` });
            let token;
            beforeEach(async () => {
                getUser = fakeUser();
                await userService.updateOne(getUser);
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

        describe('Get /user/:userId', () => {
            let getUser: User;
            const reqApi = (userId: string) => supertest(app.getHttpServer()).get(`${UserController.endPoint}/${userId}`);
            beforeEach(async () => {
                getUser = fakeUser();
                await userService.updateOne(getUser);
            });

            it('Pass', async () => {
                const res = await reqApi(getUser.id);
                expect(res.body).toBeDefined();
                expect(res.body.email).toBe(getUser.email);
            });
        });
    });

    describe('Get Users', () => {
        describe('GET /search', () => {
            beforeEach(async () => {
                await Promise.all(
                    Array.from(Array(10).keys()).map(() => {
                        const getUser = fakeUser();
                        return userService.updateOne(getUser);
                    }),
                );
            });

            it('Pass (valid queries)', async () => {
                const reqApi = () => supertest(app.getHttpServer()).get(UserController.endPoint).query({ name: 'a', currentPage: 1, pageSize: 3, orderBy: 'id', order: 'ASC' });
                const res = await reqApi();

                expect(res.body.count).not.toBe(0);
            });

            it('Pass (invalid orderBy)', async () => {
                const reqApi = () => supertest(app.getHttpServer()).get(UserController.endPoint).query({ name: '', orderBy: 'aaaa' });
                const res = await reqApi();
                expect(res.body.count).toBe(0);
            });
        });
    });

    afterAll(async () => {
        await resetDb();
        await app.close();
    });
});
