import { Repository } from 'typeorm';

export class RepositoryService<T> extends Repository<T> {
    public async findOneByField(field: keyof T, value: any): Promise<T> {
        const results = await this.createQueryBuilder().where(`"${field}" = :value`, { value }).getOne();
        return results;
    }

    public async findManyByField(field: keyof T, value: any) {
        return await this.createQueryBuilder().where(`"${field}" = :value`, { value }).getMany();
    }
}
