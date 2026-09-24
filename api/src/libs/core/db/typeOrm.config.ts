import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Config } from 'src/config';

// Shared by the Nest app (DatabaseModule) and the TypeORM CLI (migrations).
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: Config.DATABASE_URL,
  // Resolves to src/ under ts-node and dist/ at runtime, so both find the files.
  entities: [path.join(__dirname, '../../../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false,
  logging: false,
};

export default new DataSource(dataSourceOptions);
