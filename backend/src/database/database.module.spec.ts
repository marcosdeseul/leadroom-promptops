import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { drizzle } from 'drizzle-orm/postgres-js';
import { DatabaseModule } from './database.module';
import type * as schema from './schema';

type DatabaseConnection = ReturnType<typeof drizzle<typeof schema>>;

describe('DatabaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              DATABASE_URL:
                'postgresql://postgres:postgres@localhost:54322/postgres',
            }),
          ],
        }),
        DatabaseModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide DATABASE_CONNECTION', () => {
    const dbConnection = module.get<DatabaseConnection>('DATABASE_CONNECTION');
    expect(dbConnection).toBeDefined();
  });

  it('should use ConfigService for DATABASE_URL', () => {
    const configService = module.get<ConfigService>(ConfigService);
    const dbUrl = configService.get<string>('DATABASE_URL');
    expect(dbUrl).toBe(
      'postgresql://postgres:postgres@localhost:54322/postgres',
    );
  });

  it('should create database connection with correct config', () => {
    const dbConnection = module.get<DatabaseConnection>('DATABASE_CONNECTION');
    // Verify the connection object exists and has expected structure
    expect(dbConnection).toHaveProperty('execute');
    expect(typeof dbConnection.execute).toBe('function');
  });

  it('should handle undefined DATABASE_URL with empty string fallback', async () => {
    const moduleWithoutUrl = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({})], // No DATABASE_URL provided
        }),
        DatabaseModule,
      ],
    }).compile();

    const dbConnection = moduleWithoutUrl.get<DatabaseConnection>(
      'DATABASE_CONNECTION',
    );
    expect(dbConnection).toBeDefined();
  });
});
