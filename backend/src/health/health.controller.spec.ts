import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let checkHealthMock: jest.Mock;
  let checkReadinessMock: jest.Mock;

  beforeEach(async () => {
    checkHealthMock = jest.fn().mockReturnValue({ ok: true });
    checkReadinessMock = jest.fn().mockResolvedValue({ ok: true, db: true });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkHealth: checkHealthMock,
            checkReadiness: checkReadinessMock,
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return ok: true', () => {
      const result = controller.health();

      expect(result).toEqual({ ok: true });
      expect(checkHealthMock).toHaveBeenCalled();
    });
  });

  describe('readiness', () => {
    it('should return ok: true and db: true', async () => {
      const result = await controller.readiness();

      expect(result).toEqual({ ok: true, db: true });
      expect(checkReadinessMock).toHaveBeenCalled();
    });
  });
});
