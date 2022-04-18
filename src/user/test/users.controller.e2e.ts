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
    let resetDb: () => Promise<void>;
    beforeAll(async () => {
        const { getApp, module, resetDatabase } = await initTestModule();
        app = getApp;
        resetDb = resetDatabase;
        userRepository = module.get<UserRepository>(UserRepository);

        userService = module.get<UserService>(UserService);
    });

    describe('Get Users', () => {
        describe('GET /search', () => {
            beforeEach(async () => {
                await Promise.all(
                    Array.from(Array(10).keys()).map(() => {
                        const getUser = fakeUser();
                        return userService.saveUser(getUser);
                    }),
                );
            });

            it('Pass (valid queries)', async () => {
                const reqApi = () => supertest(app.getHttpServer()).get('/api/users/search').query({ name: 'a', currentPage: 1, pageSize: 3, orderBy: 'id', order: 'ASC' });
                const res = await reqApi();
                expect(res.body.count).not.toBe(0);
            });

            it('Pass (invalid page & current page)', async () => {
                const reqApi = () => supertest(app.getHttpServer()).get('/api/users/search').query({ name: '', currentPage: -1, pageSize: -3 });
                const res = await reqApi();
                expect(res.body.count).not.toBe(0);
            });

            it('Pass (invalid orderBy)', async () => {
                const reqApi = () => supertest(app.getHttpServer()).get('/api/users/search').query({ name: '', orderBy: 'aaaa' });
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
