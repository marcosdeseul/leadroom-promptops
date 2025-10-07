import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { db } from '../database/db.config';

describe('HealthService', () => {
  let service: HealthService;
  let executeSpy: jest.SpyInstance;

  beforeEach(async () => {
    executeSpy = jest.spyOn(db, 'execute').mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    executeSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return ok: true', () => {
      const result = service.checkHealth();
      expect(result).toEqual({ ok: true });
    });
  });

  describe('checkReadiness', () => {
    it('should return ok: true and db: true when database is connected', async () => {
      const result = await service.checkReadiness();

      expect(result).toEqual({ ok: true, db: true });
      expect(executeSpy).toHaveBeenCalled();
    });

    it('should return ok: false and db: false when database connection fails', async () => {
      executeSpy.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.checkReadiness();

      expect(result).toEqual({ ok: false, db: false });
      expect(executeSpy).toHaveBeenCalled();
    });
  });
});
