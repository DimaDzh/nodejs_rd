import { Provider } from '@nestjs/common';
import { Pool } from 'pg';

export const PG_POOL = Symbol('PG_POOL');

export const poolProvider: Provider = {
  provide: PG_POOL,
  useFactory: () => {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  },
};
