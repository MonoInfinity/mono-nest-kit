import { INestApplication } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { User, UserRole } from '../../core/models';
import * as supertest from 'supertest';
import { initTestModule } from '../../core/test/initTest';
import { UserService } from '../../user/user.service';
import { UpdateUserDTO } from '../dto';
import { ChangePasswordDTO } from '../dto/changePassword.dto';
import { FilterAdminUsers } from '../dto/filterUsersForAdmin';
import { UserAdminController } from '../userAdmin.controller';
import { AuthService } from './../../auth/auth.service';
import { fakeData, fakeUser } from './../../core/test/helper';
import { UserController } from './../user.controller';

describe('UserController', () => {
    let app: INestApplication;

    let currentTestAccessToken: string;
    let currentTestUser: User;
    let userService: UserService;
    let authService: AuthService;

    let resetDb: () => Promise<void>;
    beforeAll(async () => {
        const { getApp, module, resetDatabase, testAccessToken, testUser } = await initTestModule();
        app = getApp;
        resetDb = resetDatabase;
        currentTestAccessToken = testAccessToken;
        currentTestUser = testUser;
        authService = module.get<AuthService>(AuthService);

        userService = module.get<UserService>(UserService);
    });

    describe('Get Users', () => {
        describe('GET /', () => {
            const reqApi = (input: Partial<FilterAdminUsers>, token) =>
                supertest(app.getHttpServer())
                    .get(UserAdminController.endPoint)
                    .query(input)
                    .set({ authorization: `Bearer ${token}` })
                    .send();

            it('Pass (valid queries)', async () => {
                const res = await reqApi(
                    {
                        email: '',
                        name: '',
                    },
                    currentTestAccessToken,
                );

                expect(res.status).toBe(StatusCodes.OK);
                expect(res.body.data.length).toBeGreaterThanOrEqual(1);
                expect(res.body.count).not.toBe(0);
            });
        });
    });

    afterAll(async () => {
        await resetDb();
        await app.close();
    });
});
