import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/libs/core/base/base.response';
import { PatientsService } from '../services/patients.service';

@ApiTags('patients')
@Controller({ path: 'patients', version: '1' })
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll() {
    const data = await this.patientsService.findAll();
    return BaseResponse.successResponse(data);
  }
}
