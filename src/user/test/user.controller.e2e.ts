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
import { UpdateUserDTO } from '../dto';
import { EmailService } from '../../core/providers';
import { randomUUID } from 'crypto';
import { RequestVerifyEmailDTO } from 'src/auth/dto';

describe('UserController', () => {
    let app: INestApplication;

    let userService: UserService;
    let userRepository: UserRepository;
    let authService: AuthService;
    let emailService: EmailService;
    let resetDb: () => Promise<void>;
    beforeAll(async () => {
        const { getApp, module, resetDatabase } = await initTestModule();
        app = getApp;
        resetDb = resetDatabase;
        userRepository = module.get<UserRepository>(UserRepository);
        emailService = module.get<EmailService>(EmailService);
        authService = module.get<AuthService>(AuthService);

        userService = module.get<UserService>(UserService);
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

        describe('PUT /user', () => {
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

        describe('Get /user/:userId', () => {
            let getUser: User;
            const reqApi = (userId: string) => supertest(app.getHttpServer()).get(`/api/user/${userId}`);
            beforeEach(async () => {
                getUser = fakeUser();
                await userService.saveUser(getUser);
            });

            it('Pass', async () => {
                const res = await reqApi(getUser.id);
                expect(res.body).toBeDefined();
                expect(res.body.email).toBe(getUser.email);
            });
        });
    });

    describe('API /verify-email', () => {
        let getUser: User;
        let token;
        let otp;
        const sendApi = (input: RequestVerifyEmailDTO, token: string) =>
            supertest(app.getHttpServer())
                .post('/api/auth/verify-email')
                .set({ authorization: `Bearer ${token}` })
                .send(input);

        const verifyApi = (token, otp) =>
            supertest(app.getHttpServer())
                .get(`/api/auth/verify-email/${otp}`)
                .set({ authorization: `Bearer ${token}` });

        beforeEach(async () => {
            getUser = fakeUser();
            await userService.saveUser(getUser);
            token = await authService.createAccessToken(getUser);
            otp = await authService.createAccessToken(getUser, 5);
        });

        it('POST /verify-email', async () => {
            const res = await sendApi({ email: getUser.email }, token);

            expect(res).toBeDefined();
            expect(res.status).toBe(StatusCodes.CREATED);
        });

        it('GET /verify-email/:otp', async () => {
            const res = await verifyApi(token, otp);
            expect(res).toBeDefined();
            expect(res.status).toBe(StatusCodes.OK);
        });
    });

    afterAll(async () => {
        await resetDb();
        await app.close();
    });
});
