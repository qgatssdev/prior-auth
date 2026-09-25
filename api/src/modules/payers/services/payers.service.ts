import { Injectable } from '@nestjs/common';
import { PayerRepository } from '../repository/payer.repository';

@Injectable()
export class PayersService {
  constructor(private readonly payerRepository: PayerRepository) {}

  findAll() {
    return this.payerRepository.findAll({
      select: ['id', 'name', 'slug'],
      order: { name: 'ASC' },
    });
  }
}
