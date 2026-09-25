import { PriorAuthStatus } from 'src/libs/common/constants';
import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { PatientCoverage } from 'src/modules/patients/entity/patient-coverage.entity';
import { Patient } from 'src/modules/patients/entity/patient.entity';
import { Payer } from 'src/modules/payers/entity/payer.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { PriorAuthEvent } from './prior-auth-event.entity';

// Serves the queue: filter by status, newest update first, tie-break on id (keyset cursor).
@Index('idx_pa_status_updated_id', ['status', 'updatedAt', 'id'])
@Index('uq_pa_payer_ref', ['payerId', 'payerReference'], { unique: true })
@Entity()
export class PriorAuthRequest extends BaseEntity {
  @Column('uuid')
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  // The coverage this case bills. Set by the server from the chosen coverage.
  @Column('uuid')
  coverageId: string;

  @ManyToOne(() => PatientCoverage)
  @JoinColumn({ name: 'coverageId' })
  coverage: PatientCoverage;

  // Copied from the coverage: the webhook lookup, queue filter and indexes use it.
  @Column('uuid')
  payerId: string;

  @ManyToOne(() => Payer)
  @JoinColumn({ name: 'payerId' })
  payer: Payer;

  @Column()
  treatmentName: string;

  @Column()
  cptCode: string;

  @Column()
  icd10Code: string;

  @Column('date')
  serviceDate: string;

  @Column('date')
  dueBy: string;

  @Column({
    type: 'enum',
    enum: PriorAuthStatus,
    enumName: 'prior_auth_status',
    default: PriorAuthStatus.DRAFT,
  })
  status: PriorAuthStatus;

  @Column({ type: 'varchar', nullable: true })
  payerReference: string | null;

  @OneToMany(() => PriorAuthEvent, (event) => event.request)
  events: PriorAuthEvent[];
}
