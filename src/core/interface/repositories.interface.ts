import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import { constant } from '../constant';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}
const { currentPage, pageSize, orderBy } = constant.default;

export interface PagingResult<T> {
    data: Array<T>;
    count: number;
}

export class PagingFilter {
    @ApiProperty({ description: 'Current Page', example: 0, nullable: true })
    page: number;

    @ApiProperty({ description: 'Page size', example: 12, nullable: true })
    pageSize: number;

    @ApiProperty({ description: 'Order by', example: 'name', nullable: true })
    orderBy: string;

    @ApiProperty({ description: 'Order', example: SortOrder.ASC, nullable: true })
    order: SortOrder;
}

export const vPagingFilter = {
    page: joi.number().failover(currentPage).min(0).failover(0).required(),
    pageSize: joi.number().failover(pageSize).min(0).failover(12).required(),
    orderBy: joi.string().allow('').failover(orderBy).required(),
    order: joi.string().allow('').failover(SortOrder.ASC).valid(SortOrder.ASC, SortOrder.DESC).required(),
};
