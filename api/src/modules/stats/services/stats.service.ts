import { Injectable } from '@nestjs/common';
import { PriorAuthRequestRepository } from 'src/modules/prior-auths/repository/prior-auth-request.repository';
import { OPEN } from 'src/modules/prior-auths/transitions';

@Injectable()
export class StatsService {
  constructor(
    private readonly priorAuthRequestRepository: PriorAuthRequestRepository,
  ) {}

  getStats() {
    return this.priorAuthRequestRepository.countStats(OPEN);
  }
}
