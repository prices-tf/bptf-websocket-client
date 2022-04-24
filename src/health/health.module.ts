import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { RabbitMQWrapperModule } from '../rabbitmq-wrapper/rabbitmq-wrapper.module';
import { WebsocketHealthIndicator } from './websocket.health';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TerminusModule, RabbitMQWrapperModule, WebsocketModule],
  providers: [RabbitMQHealthIndicator, WebsocketHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
