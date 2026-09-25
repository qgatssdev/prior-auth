import { Module } from '@nestjs/common';
import { PatientsModule } from './patients/patients.module';
import { PayersModule } from './payers/payers.module';
import { PriorAuthsModule } from './prior-auths/prior-auths.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [PriorAuthsModule, PatientsModule, PayersModule, StatsModule],
})
export class DomainModule {}
