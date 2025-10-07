import { Injectable } from '@nestjs/common';
import { db } from '../database/db.config';
import { sql } from 'drizzle-orm';

@Injectable()
export class HealthService {
  checkHealth(): { ok: boolean } {
    return { ok: true };
  }

  async checkReadiness(): Promise<{ ok: boolean; db: boolean }> {
    try {
      await db.execute(sql`SELECT 1`);
      return { ok: true, db: true };
    } catch {
      return { ok: false, db: false };
    }
  }
}
