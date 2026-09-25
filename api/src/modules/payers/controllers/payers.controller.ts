import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/libs/core/base/base.response';
import { PayersService } from '../services/payers.service';

@ApiTags('payers')
@Controller({ path: 'payers', version: '1' })
export class PayersController {
  constructor(private readonly payersService: PayersService) {}

  @Get()
  async findAll() {
    const data = await this.payersService.findAll();
    return BaseResponse.successResponse(data);
  }
}
