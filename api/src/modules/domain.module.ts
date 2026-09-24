import { Module } from '@nestjs/common';
import { PriorAuthsModule } from './prior-auths/prior-auths.module';

@Module({
  imports: [PriorAuthsModule],
})
export class DomainModule {}
