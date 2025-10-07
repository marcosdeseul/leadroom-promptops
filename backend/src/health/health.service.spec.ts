import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { db } from '../database/db.config';

jest.mock('../database/db.config', () => ({
  db: {
    execute: jest.fn().mockResolvedValue([]),
  },
}));

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
    jest.clearAllMocks();
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
      expect(db.execute).toHaveBeenCalled();
    });

    it('should return ok: false and db: false when database connection fails', async () => {
      jest.spyOn(db, 'execute').mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.checkReadiness();
      expect(result).toEqual({ ok: false, db: false });
      expect(db.execute).toHaveBeenCalled();
    });
  });
});
