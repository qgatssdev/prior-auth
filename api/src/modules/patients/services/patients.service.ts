import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../repository/patient.repository';

@Injectable()
export class PatientsService {
  constructor(private readonly patientRepository: PatientRepository) {}

  findAll() {
    // Each patient with their active coverages, primary first, for the New request form.
    return this.patientRepository.findAll({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        coverages: {
          id: true,
          payerId: true,
          memberId: true,
          priority: true,
          payer: { id: true, name: true },
        },
      },
      relations: { coverages: { payer: true } },
      where: { coverages: { active: true } },
      order: {
        lastName: 'ASC',
        firstName: 'ASC',
        coverages: { priority: 'ASC' },
      },
    });
  }
}
