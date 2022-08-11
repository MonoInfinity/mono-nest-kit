import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import { PagingFilter, vPagingFilter } from '../../core/interface';

export class FilterUsersDTO extends PagingFilter {
    @ApiProperty({ description: 'Name', example: 'ha', nullable: true })
    name: string;
}

export const vFilterUsersDto = joi.object({
    name: joi.string().allow('').failover('').required(),
    ...vPagingFilter,
});
