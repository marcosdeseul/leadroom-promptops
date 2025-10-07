import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('healthz')
  health() {
    return this.healthService.checkHealth();
  }

  @Get('readyz')
  async readiness() {
    return this.healthService.checkReadiness();
  }
}
