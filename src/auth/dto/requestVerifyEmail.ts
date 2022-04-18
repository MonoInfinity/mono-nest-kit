import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import { userValidateSchema } from '../../core/models';

export class RequestVerifyEmailDTO {
    @ApiProperty({ description: 'Username', example: 'haicao2805@gmail.com' })
    email: string;
}

export const vRequestVerifyEmailDTO = joi.object<RequestVerifyEmailDTO>({
    email: userValidateSchema.email,
});
