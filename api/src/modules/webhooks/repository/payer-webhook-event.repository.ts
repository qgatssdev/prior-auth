import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from 'src/libs/core/base/base.repository';
import { EntityManager } from 'typeorm';
import { PayerWebhookEvent } from '../entity/payer-webhook-event.entity';

export class PayerWebhookEventRepository extends BaseRepository<PayerWebhookEvent> {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(entityManager.getRepository(PayerWebhookEvent));
  }
}
