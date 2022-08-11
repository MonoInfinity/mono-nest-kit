import { FilterUsersDTO } from './../../user/dto/filterUsers.dto';
import { EntityRepository } from 'typeorm';
import { PagingResult } from '../interface';
import { User } from '../models';
import { RepositoryService } from './repository';

@EntityRepository(User)
export class UserRepository extends RepositoryService<User> {
    async searchUserByName(filter: FilterUsersDTO): Promise<PagingResult<User>> {
        const { tableName } = this.metadata;
        const query = this.createQueryBuilder(tableName).where(`${tableName}.name LIKE (:name)  ${this.defaultQuery(tableName)} `, {
            name: `%${filter.name}%`,
        });

        return this.paging(query, filter);
    }
}
