import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PatientCoverage } from './patient-coverage.entity';

@Entity()
export class Patient extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('date')
  dateOfBirth: string;

  @OneToMany(() => PatientCoverage, (coverage) => coverage.patient)
  coverages: PatientCoverage[];
}
