import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActorType } from 'src/libs/common/constants';
import { BaseResponse } from 'src/libs/core/base/base.response';
import { CreatePriorAuthDto } from '../dto/create-prior-auth.dto';
import { ListQueryDto } from '../dto/list-query.dto';
import { TransitionDto } from '../dto/transition.dto';
import { PriorAuthsService } from '../services/prior-auths.service';

// No auth in this project, so every UI action is made by the same demo user.
const DEMO_USER = { type: ActorType.USER, name: 'Demo specialist' };

@ApiTags('prior-auths')
@Controller({ path: 'prior-auths', version: '1' })
export class PriorAuthsController {
  constructor(private readonly priorAuthsService: PriorAuthsService) {}

  @Get()
  async list(@Query() query: ListQueryDto) {
    const data = await this.priorAuthsService.list(query);
    return BaseResponse.successResponse(data);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.priorAuthsService.findOne(id);
    return BaseResponse.successResponse(data);
  }

  @Post()
  async create(@Body() dto: CreatePriorAuthDto) {
    const data = await this.priorAuthsService.create(dto);
    return BaseResponse.successResponse(data, 'Draft created');
  }

  @Post(':id/transition')
  @HttpCode(HttpStatus.OK)
  async transition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { toStatus, note }: TransitionDto,
  ) {
    const data = await this.priorAuthsService.transition(
      id,
      toStatus,
      DEMO_USER,
      note,
    );
    return BaseResponse.successResponse(data, `Moved to ${toStatus}`);
  }
}
