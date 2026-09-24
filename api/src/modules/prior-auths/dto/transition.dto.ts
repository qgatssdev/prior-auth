import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PriorAuthStatus } from 'src/libs/common/constants';

export class TransitionDto {
  @IsEnum(PriorAuthStatus)
  toStatus: PriorAuthStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
