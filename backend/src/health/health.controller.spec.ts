import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkHealth: jest.fn().mockReturnValue({ ok: true }),
            checkReadiness: jest.fn().mockResolvedValue({ ok: true, db: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return ok: true', () => {
      const result = controller.health();
      expect(result).toEqual({ ok: true });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.checkHealth).toHaveBeenCalled();
    });
  });

  describe('readiness', () => {
    it('should return ok: true and db: true', async () => {
      const result = await controller.readiness();
      expect(result).toEqual({ ok: true, db: true });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.checkReadiness).toHaveBeenCalled();
    });
  });
});
