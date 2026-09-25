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

export class ListQueryDto {
  @IsOptional()
  @IsIn(['OPEN', ...Object.values(PriorAuthStatus)])
  status: 'OPEN' | PriorAuthStatus = 'OPEN';

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
