import { Module } from '@nestjs/common';
import { CoreModule } from './libs/core/core.module';
import { DomainModule } from './modules/domain.module';

@Module({
  imports: [CoreModule, DomainModule],
})
export class AppModule {}
