import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
})
export class CoreModule {}
