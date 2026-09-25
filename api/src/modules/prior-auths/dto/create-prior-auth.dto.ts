import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreatePriorAuthDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  payerId: string;

  @IsString()
  @IsNotEmpty()
  treatmentName: string;

  @IsString()
  @IsNotEmpty()
  cptCode: string;

  @IsString()
  @IsNotEmpty()
  icd10Code: string;

  // The "at least 4 days away" rule depends on today, so the service checks it.
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'serviceDate must be YYYY-MM-DD' })
  serviceDate: string;
}
