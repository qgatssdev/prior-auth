import { Module } from '@nestjs/common';
import { PriorAuthsController } from './controllers/prior-auths.controller';
import { PriorAuthsService } from './services/prior-auths.service';

@Module({
  controllers: [PriorAuthsController],
  providers: [PriorAuthsService],
  exports: [PriorAuthsService],
})
export class PriorAuthsModule {}
