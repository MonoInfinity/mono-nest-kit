import { PagingFilter, PagingResult } from './../core/interface/repositories.interface';
import { FilterUsersDTO } from './dto/filterUsers.dto';
import { SortOrder } from './../core/interface';
import { Injectable } from '@nestjs/common';
import { User, UserRole, UserStatus } from '../core/models';
import { UserRepository } from '../core/repositories';
import { constant } from '../core';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async updateOne(user: User): Promise<User> {
        user.createAt = new Date().getTime();
        return await this.userRepository.save(user);
    }

    async findOne(field: keyof User, value: any): Promise<User> {
        return await this.userRepository.findOneByField(field, value);
    }

    async findMany(filter: FilterUsersDTO): Promise<PagingResult<User>> {
        const result = await this.userRepository.searchUserByName(filter);
        result.data = result.data.map((user) => ({ ...user, password: '' }));
        return result;
    }
}
