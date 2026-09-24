import { WebhookResult } from 'src/libs/common/constants';
import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { Payer } from 'src/modules/payers/entity/payer.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

// Idempotency guarantee. Partial (signed rows only) so a forged request can't
// claim a real eventId and make the genuine delivery look like a duplicate.
@Index('uq_webhook_payer_event', ['payerId', 'externalEventId'], {
  unique: true,
  where: '"signatureValid" = true',
})
@Entity()
export class PayerWebhookEvent extends BaseEntity {
  @Column('uuid')
  payerId: string;

  @ManyToOne(() => Payer)
  @JoinColumn({ name: 'payerId' })
  payer: Payer;

  @Column()
  externalEventId: string;

  @Column('jsonb')
  payload: unknown;

  @Column()
  signatureValid: boolean;

  @Column({ type: 'varchar', nullable: true })
  result: WebhookResult | null;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}
