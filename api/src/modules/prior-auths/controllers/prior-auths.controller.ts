import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActorType } from 'src/libs/common/constants';
import { BaseResponse } from 'src/libs/core/base/base.response';
import { TransitionDto } from '../dto/transition.dto';
import { PriorAuthsService } from '../services/prior-auths.service';

// No auth in this project, so every UI action is made by the same demo user.
const DEMO_USER = { type: ActorType.USER, name: 'Demo specialist' };

@ApiTags('prior-auths')
@Controller({ path: 'prior-auths', version: '1' })
export class PriorAuthsController {
  constructor(private readonly priorAuthsService: PriorAuthsService) {}

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
