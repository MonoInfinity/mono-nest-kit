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

    async findMany(field: keyof User, value: any): Promise<User[]> {
        return await this.userRepository.findManyByField(field, value);
    }

    async filterUsers(name: string, currentPage: number, pageSize: number, orderBy: string, order: SortOrder): Promise<{ data: User[]; count: number }> {
        const query = this.userRepository.createQueryBuilder('user').where(`user.name LIKE (:name)`, {
            name: `%${name}%`,
        });

        try {
            const users = await query
                .orderBy(`user.${orderBy}`, order)
                .skip(currentPage * pageSize)
                .take(pageSize)
                .getMany();

            const count = await query.getCount();

            return { data: users, count };
        } catch (err) {
            return { data: [], count: 0 };
        }
    }
}
