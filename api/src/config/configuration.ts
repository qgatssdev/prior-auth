import { Logger } from '@nestjs/common';
import { IsInt, IsString, validateSync } from 'class-validator';
import { config } from 'dotenv';

config();

class Configuration {
  private readonly logger = new Logger(Configuration.name);

  @IsInt()
  readonly PORT = Number(process.env.PORT) || 4000;

  @IsString()
  readonly DATABASE_URL = process.env.DATABASE_URL as string;

  @IsString()
  readonly API_BASE_URL = process.env.API_BASE_URL as string;

  @IsString()
  readonly FRONTEND_URL = process.env.FRONTEND_URL as string;

  constructor() {
    const error = validateSync(this);
    if (!error.length) return;
    this.logger.error(`Config validation error: ${JSON.stringify(error[0])}`);
    process.exit(1);
  }
}

export const Config = new Configuration();
