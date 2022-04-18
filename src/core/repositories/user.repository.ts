import { EntityRepository } from 'typeorm';
import { User } from '../models';
import { RepositoryService } from '../providers';

@EntityRepository(User)
export class UserRepository extends RepositoryService<User> {}
