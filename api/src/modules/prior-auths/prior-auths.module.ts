import { Module } from '@nestjs/common';
import { PriorAuthsController } from './controllers/prior-auths.controller';
import { PriorAuthRequestRepository } from './repository/prior-auth-request.repository';
import { PriorAuthsService } from './services/prior-auths.service';

@Module({
  controllers: [PriorAuthsController],
  providers: [PriorAuthsService, PriorAuthRequestRepository],
  exports: [PriorAuthsService, PriorAuthRequestRepository],
})
export class PriorAuthsModule {}
