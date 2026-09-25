import { Module } from '@nestjs/common';
import { PatientsModule } from './patients/patients.module';
import { PayersModule } from './payers/payers.module';
import { PriorAuthsModule } from './prior-auths/prior-auths.module';
import { SimulatorModule } from './simulator/simulator.module';
import { StatsModule } from './stats/stats.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    PriorAuthsModule,
    PatientsModule,
    PayersModule,
    StatsModule,
    WebhooksModule,
    SimulatorModule,
  ],
})
export class DomainModule {}
