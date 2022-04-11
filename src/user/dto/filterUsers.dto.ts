import { constant } from './../../core/constant';
import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import { SortOrder } from '../../core/interface';

const { currentPage, pageSize, orderBy } = constant.default;

export class FilterUsersDTO {
    @ApiProperty({ description: 'Name', example: 'ha', nullable: true })
    name: string;

    @ApiProperty({ description: 'Current Page', example: 1, nullable: true })
    currentPage: number;

    @ApiProperty({ description: 'Page size', example: 4, nullable: true })
    pageSize: number;

    @ApiProperty({ description: 'Order by', example: 'name', nullable: true })
    orderBy: string;

    @ApiProperty({ description: 'Order', example: 'asc', nullable: true })
    order: SortOrder;
}

export const vFilterUsersDto = joi.object({
    currentPage: joi.number().failover(currentPage).min(0).required(),
    name: joi.string().allow('').failover('').required(),
    pageSize: joi.number().failover(pageSize).min(0).required(),
    orderBy: joi.string().allow('').failover(orderBy).required(),
    order: joi.string().allow('').failover(SortOrder.ASC).valid(SortOrder.ASC, SortOrder.DESC).required(),
});
