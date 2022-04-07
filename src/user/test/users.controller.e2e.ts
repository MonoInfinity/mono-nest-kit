import { fakeUser } from './../../core/test/helper';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../../core/repositories';
import { UserService } from '../../user/user.service';
import { initTestModule } from '../../core/test/initTest';
import * as supertest from 'supertest';

describe('UsersController', () => {
    let app: INestApplication;

    let userService: UserService;
    let userRepository: UserRepository;
    beforeAll(async () => {
        const { getApp, module } = await initTestModule();
        app = getApp;

        userRepository = module.get<UserRepository>(UserRepository);

        userService = module.get<UserService>(UserService);
    });

    describe('Get Users', () => {
        describe('GET /search', () => {
            beforeEach(async () => {
                const getUser = fakeUser();
                await userService.saveUser(getUser);
            });

            it('Pass (valid queries)', async () => {
                const reqApi = () => supertest(app.getHttpServer()).get('/api/users/search').query({ name: 'a', currentPage: 1, pageSize: 3 });
                const res = await reqApi();
                expect(res.body.length).not.toBe(0);
            });

            it('Pass (invalid queries)', async () => {
                const reqApi = () => supertest(app.getHttpServer()).get('/api/users/search').query({ name: '', currentPage: -1, pageSize: -3 });
                const res = await reqApi();
                expect(res.body.length).not.toBe(0);
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
