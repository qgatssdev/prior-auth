import { Module } from '@nestjs/common';
import { DomainModule } from './modules/domain.module';

@Module({
  imports: [DomainModule],
})
export class AppModule {}
