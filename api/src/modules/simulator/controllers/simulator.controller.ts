import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/libs/core/base/base.response';
import { SimulateDto } from '../dto/simulate.dto';
import { SimulatorService } from '../services/simulator.service';

@ApiTags('simulator (demo only)')
@Controller({ path: 'simulator', version: '1' })
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post('payers/:slug/send')
  @HttpCode(HttpStatus.OK)
  async send(@Param('slug') slug: string, @Body() dto: SimulateDto) {
    const data = await this.simulatorService.send(slug, dto);
    return BaseResponse.successResponse(data);
  }
}
