import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { WebsocketHealthIndicator } from './websocket.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private rabbitmqHealthIndicator: RabbitMQHealthIndicator,
    private websocketHealthIndicator: WebsocketHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.rabbitmqHealthIndicator.isHealthy('rabbitmq'),
      () => this.websocketHealthIndicator.isHealthy('websocket'),
    ]);
  }
}
