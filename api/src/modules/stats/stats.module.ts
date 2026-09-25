import { Module } from '@nestjs/common';
import { PriorAuthsModule } from '../prior-auths/prior-auths.module';
import { StatsController } from './controllers/stats.controller';
import { StatsService } from './services/stats.service';

@Module({
  imports: [PriorAuthsModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
