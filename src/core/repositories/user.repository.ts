import { FilterUsersDTO } from './../../user/dto/filterUsers.dto';
import { EntityRepository } from 'typeorm';
import { CompareOperator, PagingResult } from '../interface';
import { User } from '../models';
import { RepositoryService } from './repository';
import { FilterAdminUsers } from 'src/user/dto/filterUsersForAdmin';
import { queryGenerator } from '../utils';

@EntityRepository(User)
export class UserRepository extends RepositoryService<User> {
    async searchUserByName(filter: FilterUsersDTO): Promise<PagingResult<User>> {
        const { tableName } = this.metadata;
        const query = this.createQueryBuilder(tableName).where(
            `${tableName}.name LIKE (:name)  ${this.defaultQuery(tableName)} `,
            {
                name: `%${filter.name}%`,
            },
        );

        return this.paging(query, filter);
    }

    async getManyUserWithPagination(filter: FilterAdminUsers): Promise<PagingResult<User>> {
        const { tableName } = this.metadata;

        return this.paging(
            this.createQueryBuilder(tableName).where(
                queryGenerator(tableName, filter, {
                    email: CompareOperator.LIKE,
                    name: CompareOperator.LIKE,
                    phone: CompareOperator.LIKE,
                    role: CompareOperator.LIKE,
                    status: CompareOperator.EQUAL,
                }),
                filter,
            ),
            filter,
        );
    }
}
