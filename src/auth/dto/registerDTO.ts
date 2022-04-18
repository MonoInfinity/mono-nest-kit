import * as joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { userValidateSchema } from '../../core/models';

export class RegisterDTO {
    @ApiProperty({ description: 'Username', example: 'haicao@gmail.com' })
    email: string;

    @ApiProperty({ description: 'Name', example: 'Cao Chi Hai' })
    name: string;

    @ApiProperty({ description: 'Password', example: 'Aa123456' })
    password: string;

    @ApiProperty({ description: 'Confirm password', example: 'Aa123456' })
    confirmPassword: string;
}

export const vRegisterDTO = joi.object<RegisterDTO>({
    name: userValidateSchema.name,
    email: userValidateSchema.email,
    password: userValidateSchema.password,
    confirmPassword: joi.string().required().valid(joi.ref('password')),
});
