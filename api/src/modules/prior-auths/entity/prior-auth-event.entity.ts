import { ActorType, PriorAuthStatus } from 'src/libs/common/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PriorAuthRequest } from './prior-auth-request.entity';

// Append-only audit trail, so it skips BaseEntity: no updatedAt or version, rows never change.
@Index('idx_pa_event_request_created', ['requestId', 'createdAt'])
@Entity()
export class PriorAuthEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  requestId: string;

  @ManyToOne(() => PriorAuthRequest, (request) => request.events)
  @JoinColumn({ name: 'requestId' })
  request: PriorAuthRequest;

  @Column({
    type: 'enum',
    enum: PriorAuthStatus,
    enumName: 'prior_auth_status',
    nullable: true,
  })
  fromStatus: PriorAuthStatus | null;

  @Column({
    type: 'enum',
    enum: PriorAuthStatus,
    enumName: 'prior_auth_status',
  })
  toStatus: PriorAuthStatus;

  @Column({ type: 'enum', enum: ActorType, enumName: 'actor_type' })
  actorType: ActorType;

  @Column()
  actorName: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
