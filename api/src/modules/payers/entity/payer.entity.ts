import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Payer extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  // select: false keeps the secret out of every query unless explicitly asked for.
  @Column({ select: false })
  webhookSecret: string;

  @Column('int')
  avgTurnaroundDays: number;
}
