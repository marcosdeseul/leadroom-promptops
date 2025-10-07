import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

type DatabaseConnection = ReturnType<typeof drizzle<typeof schema>>;

@Injectable()
export class HealthService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: DatabaseConnection,
  ) {}

  checkHealth(): { ok: boolean } {
    return { ok: true };
  }

  async checkReadiness(): Promise<{ ok: boolean; db: boolean }> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { ok: true, db: true };
    } catch {
      return { ok: false, db: false };
    }
  }
}
