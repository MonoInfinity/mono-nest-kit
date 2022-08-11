import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import { CommonFilter, vCommonFilter } from '../../core/interface';

export class FilterUsersDTO extends CommonFilter {
    @ApiProperty({ description: 'Name', example: 'ha', nullable: true })
    name: string;
}

export const vFilterUsersDto = joi.object({
    name: joi.string().allow('').failover('').required(),
    ...vCommonFilter,
});
