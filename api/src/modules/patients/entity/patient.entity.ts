import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { Payer } from 'src/modules/payers/entity/payer.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Patient extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('date')
  dateOfBirth: string;

  @Column()
  memberId: string;

  @Column('uuid')
  payerId: string;

  @ManyToOne(() => Payer)
  @JoinColumn({ name: 'payerId' })
  payer: Payer;
}
