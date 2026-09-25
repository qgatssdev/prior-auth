import { Module } from '@nestjs/common';
import { PayersModule } from '../payers/payers.module';
import { SimulatorController } from './controllers/simulator.controller';
import { SimulatorService } from './services/simulator.service';

// DEMO ONLY: plays the insurer by signing and sending webhooks to our own API.
// A real deployment would not include this module.
@Module({
  imports: [PayersModule],
  controllers: [SimulatorController],
  providers: [SimulatorService],
})
export class SimulatorModule {}
