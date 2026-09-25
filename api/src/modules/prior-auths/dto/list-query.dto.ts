import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PriorAuthStatus } from 'src/libs/common/constants';
import { STATUS_GROUPS, type StatusGroup } from '../transitions';

export class ListQueryDto {
  @IsOptional()
  // A group (OPEN, PENDING, ALL) or a single status.
  @IsIn([...Object.keys(STATUS_GROUPS), ...Object.values(PriorAuthStatus)])
  status: StatusGroup | PriorAuthStatus = 'OPEN';

  @IsOptional()
  @IsUUID()
  payerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 25;

  @IsOptional()
  @IsString()
  cursor?: string;
}
