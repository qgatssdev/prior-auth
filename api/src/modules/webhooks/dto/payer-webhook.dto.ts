import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const PAYER_STATUS_WORDS = [
  'pending',
  'needs_info',
  'approved',
  'denied',
] as const;
export type PayerStatusWord = (typeof PAYER_STATUS_WORDS)[number];

export class PayerWebhookDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  payerReference: string;

  @IsIn(PAYER_STATUS_WORDS)
  status: PayerStatusWord;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
