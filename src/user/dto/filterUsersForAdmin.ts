import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import { UserRole, UserStatus } from '../../core/models';
import { PagingFilter, vPagingFilter } from '../../core/interface';

export class FilterAdminUsers extends PagingFilter {
    @ApiProperty({ description: 'Name', example: 'ha', nullable: true })
    name: string;

    @ApiProperty({ description: 'Email', example: 'hello@gmail.com', nullable: true })
    email: string;

    @ApiProperty({ description: 'Role', example: UserRole.USER, nullable: true })
    role: UserRole;

    @ApiProperty({ description: 'Status', example: UserStatus.ACTIVE, nullable: true })
    status: UserStatus;

    @ApiProperty({ description: 'Phone', example: false, nullable: true })
    phone: boolean;

    static validate = joi.object({
        name: joi.string().allow('').failover(null).required(),
        email: joi.string().allow('').failover(null).required(),
        role: joi.string().allow('').failover(null).required(),
        status: joi.string().allow('').failover(null).required(),
        phone: joi.boolean().failover(null).required(),
        ...vPagingFilter,
    });
}
