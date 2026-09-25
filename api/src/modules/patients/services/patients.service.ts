import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../repository/patient.repository';

@Injectable()
export class PatientsService {
  constructor(private readonly patientRepository: PatientRepository) {}

  findAll() {
    return this.patientRepository.findAll({
      select: ['id', 'firstName', 'lastName', 'memberId', 'payerId'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }
}
