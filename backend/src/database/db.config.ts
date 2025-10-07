/**
 * @deprecated This file is being migrated to DatabaseModule
 *
 * MIGRATION NOTICE:
 * The database connection is now managed by DatabaseModule using ConfigService.
 * This ensures .env variables are loaded before creating the connection.
 *
 * OLD (import-time initialization):
 *   import { db } from './db.config';
 *
 * NEW (dependency injection):
 *   constructor(@Inject('DATABASE_CONNECTION') private readonly db: DatabaseConnection) {}
 *
 * See: src/database/database.module.ts
 */

export * from './schema';
