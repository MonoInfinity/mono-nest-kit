import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StatusCodes } from 'http-status-codes';
import * as supertest from 'supertest';
import { User } from '../../core/models';
import { EmailService } from '../../core/providers';
import { UserRepository } from '../../core/repositories';
import { fakeUser } from '../../core/test/helper';
import { initTestModule } from '../../core/test/initTest';
import { UserService } from '../../user/user.service';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDTO, RegisterDTO, RequestVerifyEmailDTO } from '../dto';

describe('AuthController', () => {
    let app: INestApplication;

    let authService: AuthService;
    let userService: UserService;
    let userRepository: UserRepository;
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

    describe('Post User', () => {
        describe('POST /verify-email', () => {
            const reqApi = (input: RequestVerifyEmailDTO) => supertest(app.getHttpServer()).post(`${AuthController.endPoint}/verify-email`).send(input);
            let user: User;
            beforeEach(async () => {
                user = fakeUser();
                user.isVerified = false;
                await userService.updateOne(user);
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

            it('Failed email service went wrong', async () => {
                const mySpy = jest.spyOn(emailService, 'sendEmailForVerify').mockImplementation(() => Promise.resolve(false));

                const res = await reqApi({ email: user.email });
                expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

                mySpy.mockClear();
            });
        });

        describe('GET /verify-email/:otp', () => {
            const reqApi = (otp: string) => supertest(app.getHttpServer()).get(`${AuthController.endPoint}/verify-email/${otp}`).send();
            let user: User;
            let otp: string;
            beforeEach(async () => {
                user = fakeUser();
                user.isVerified = false;
                await userService.updateOne(user);

                otp = await authService.createAccessToken(user, 5);
            });

            it('Pass', async () => {
                const res = await reqApi(otp);
                const getUser = await userRepository.findOne({ email: user.email });
                expect(getUser.isVerified).toBeTruthy();
                expect(res.status).toBe(StatusCodes.OK);
            });

            it('Failed invalid token', async () => {
                const res = await reqApi('hello');
                const getUser = await userRepository.findOne({ email: user.email });

                expect(getUser.isVerified).toBeFalsy();
                expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
            });

            it('Failed invalid token', async () => {
                const token = await authService.createAccessToken({ ...fakeUser(), id: randomUUID() }, 5);
                const res = await reqApi(token);
                const getUser = await userRepository.findOne({ email: user.email });

                expect(getUser.isVerified).toBeFalsy();
                expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
            });
        });
    });

    describe('Common Authentication', () => {
        describe('POST /login', () => {
            let loginUserData: LoginDTO;
            const reqApi = (input: LoginDTO) => supertest(app.getHttpServer()).post(`${AuthController.endPoint}/login`).send(input);

            beforeEach(async () => {
                const getUser = fakeUser();
                loginUserData = {
                    email: getUser.email,
                    password: getUser.password,
                };
                getUser.password = await authService.encryptPassword(getUser.password, 2);
                await userService.updateOne(getUser);
            });

            it('Pass', async () => {
                const res = await reqApi(loginUserData);

                expect(res.body.token).not.toBeNull();
            });

            it('Failed (username is not correct)', async () => {
                loginUserData.email = 'updateaaabbbccc@gmail.com';
                const res = await reqApi(loginUserData);

                expect(res.status).toBe(StatusCodes.BAD_REQUEST);
            });

            it('Failed (password is not correct)', async () => {
                loginUserData.password = '123AABBDASDaa';
                const res = await reqApi(loginUserData);
                expect(res.status).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        describe('POST /register', () => {
            let registerData: RegisterDTO;
            const reqApi = (input: RegisterDTO) => supertest(app.getHttpServer()).post(`${AuthController.endPoint}/register`).send(input);
            let getUser: User;
            beforeEach(async () => {
                getUser = fakeUser();
                registerData = {
                    email: getUser.email,
                    password: getUser.password,
                    confirmPassword: getUser.password,
                    name: getUser.name,
                };
            });
            it('Pass', async () => {
                const res = await reqApi(registerData);
                const user = await userRepository.findOneByField('email', getUser.email);

                expect(user.name).toBe(getUser.name);
                expect(res.body.token).not.toBeNull();
            });

            it('Failed (username taken)', async () => {
                await userService.updateOne(getUser);
                const res = await reqApi(registerData);
                expect(res.status).toBe(StatusCodes.BAD_REQUEST);
            });
        });

        describe('POST /logout', () => {
            const reqApi = () => supertest(app.getHttpServer()).post(`${AuthController.endPoint}/logout`).send();

            it('Pass', async () => {
                const res = await reqApi();

                expect(res.status).toBe(StatusCodes.CREATED);
            });
        });
    });

    afterAll(async () => {
        await resetDb();
        await app.close();
    });
});
