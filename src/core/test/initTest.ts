import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { AppModule } from '../../app.module';
import { UserRepository } from '../repositories';
import { router } from '../router';
import { fakeUser } from './helper';
import { faker } from '@faker-js/faker';

const resetDatabase = async (module: TestingModule) => {
    //     const userRepository = module.get<UserRepository>(UserRepository);
    //     await userRepository.createQueryBuilder().delete().execute();
    //     await userRepository.clear();
};

export const initTestModule = async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const configModule = module.createNestApplication();
    //apply middleware
    router(configModule);
    const getApp = await configModule.init();

    //create a fake user and token
    const userRepository = module.get<UserRepository>(UserRepository);
    const authService = module.get<AuthService>(AuthService);
    const testUser = await authService.createOne('testaccount', 'testaccount', faker.internet.email());
    const token = await authService.createAccessToken(testUser);

    return {
        resetDatabase: async () => await resetDatabase(module),
        getFakeUser: async () => await userRepository.save(fakeUser()),
        testUser: testUser,
        testAccessToken: token,
        getApp,
        module,
        configModule,
    };
};
