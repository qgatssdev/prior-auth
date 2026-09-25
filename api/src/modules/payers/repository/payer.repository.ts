import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from 'src/libs/core/base/base.repository';
import { EntityManager } from 'typeorm';
import { Payer } from '../entity/payer.entity';

export class PayerRepository extends BaseRepository<Payer> {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(entityManager.getRepository(Payer));
  }

  // webhookSecret is select: false, so it has to be asked for explicitly.
  findBySlugWithSecret(slug: string) {
    return this.createQueryBuilder('payer')
      .addSelect('payer.webhookSecret')
      .where('payer.slug = :slug', { slug })
      .getOne();
  }
}
