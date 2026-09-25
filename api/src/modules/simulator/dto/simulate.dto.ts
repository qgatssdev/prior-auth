import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  PAYER_STATUS_WORDS,
  type PayerStatusWord,
} from 'src/modules/webhooks/dto/payer-webhook.dto';

export const SIMULATOR_MODES = [
  'normal',
  'duplicate',
  'bad_signature',
] as const;
export type SimulatorMode = (typeof SIMULATOR_MODES)[number];

export class SimulateDto {
  @IsString()
  @IsNotEmpty()
  payerReference: string;

  @IsIn(PAYER_STATUS_WORDS)
  status: PayerStatusWord;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsIn(SIMULATOR_MODES)
  mode: SimulatorMode;
}
