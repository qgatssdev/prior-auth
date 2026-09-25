import { CoveragePriority } from 'src/libs/common/constants';
import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { Payer } from 'src/modules/payers/entity/payer.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

// One insurance plan a patient holds. The member ID belongs to the plan, not the patient.
@Index('uq_coverage_patient_payer', ['patientId', 'payerId'], { unique: true })
// At most one active PRIMARY and one active SECONDARY per patient.
@Index('uq_coverage_patient_priority', ['patientId', 'priority'], {
  unique: true,
  where: '"active" = true',
})
@Entity()
export class PatientCoverage extends BaseEntity {
  @Column('uuid')
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.coverages)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column('uuid')
  payerId: string;

  @ManyToOne(() => Payer)
  @JoinColumn({ name: 'payerId' })
  payer: Payer;

  @Column()
  memberId: string;

  @Column({
    type: 'enum',
    enum: CoveragePriority,
    enumName: 'coverage_priority',
  })
  priority: CoveragePriority;

  @Column({ default: true })
  active: boolean;
}
