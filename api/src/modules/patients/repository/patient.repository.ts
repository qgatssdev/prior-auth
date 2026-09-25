import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from 'src/libs/core/base/base.repository';
import { EntityManager } from 'typeorm';
import { Patient } from '../entity/patient.entity';

export class PatientRepository extends BaseRepository<Patient> {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(entityManager.getRepository(Patient));
  }
}
