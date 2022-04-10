import { SortOrder } from './../core/interface';
import { QueryJoiValidatorPipe } from './../core/pipe/queryValidator.pipe';
import { FilterUsersDTO, vFilterUsersDto } from './dto/filterUsers.dto';
import { Controller, Get, Query, Res, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UserService) {}

    @Get('/search')
    @UsePipes(new QueryJoiValidatorPipe(vFilterUsersDto))
    async filterUsers(@Query() queries: FilterUsersDTO, @Res() res: Response) {
        const { name, currentPage, pageSize, orderBy, order } = queries;

        const result = await this.userService.filterUsers(name, currentPage, pageSize, orderBy, order as SortOrder);

        return res.send(result);
    }
}
