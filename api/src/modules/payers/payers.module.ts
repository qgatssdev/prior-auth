import { Module } from '@nestjs/common';
import { PayersController } from './controllers/payers.controller';
import { PayerRepository } from './repository/payer.repository';
import { PayersService } from './services/payers.service';

@Module({
  controllers: [PayersController],
  providers: [PayersService, PayerRepository],
  exports: [PayerRepository],
})
export class PayersModule {}
