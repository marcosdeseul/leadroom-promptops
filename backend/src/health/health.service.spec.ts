import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let mockDbExecute: jest.Mock;

  beforeEach(async () => {
    mockDbExecute = jest.fn().mockResolvedValue([] as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: {
            execute: mockDbExecute,
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
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
      expect(mockDbExecute).toHaveBeenCalled();
    });

    it('should return ok: false and db: false when database connection fails', async () => {
      mockDbExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.checkReadiness();

      expect(result).toEqual({ ok: false, db: false });
      expect(mockDbExecute).toHaveBeenCalled();
    });
  });
});
