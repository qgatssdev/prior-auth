import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/libs/core/base/base.response';
import { StatsService } from '../services/stats.service';

@ApiTags('stats')
@Controller({ path: 'stats', version: '1' })
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats() {
    const data = await this.statsService.getStats();
    return BaseResponse.successResponse(data);
  }
}
