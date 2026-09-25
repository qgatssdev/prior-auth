import { Module } from '@nestjs/common';
import { PatientsController } from './controllers/patients.controller';
import { PatientRepository } from './repository/patient.repository';
import { PatientsService } from './services/patients.service';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository],
})
export class PatientsModule {}
