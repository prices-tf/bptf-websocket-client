import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQWrapperModule } from '../rabbitmq-wrapper/rabbitmq-wrapper.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { EventService } from './event.service';

@Module({
  imports: [ConfigModule, RabbitMQWrapperModule, WebsocketModule],
  providers: [EventService],
})
export class EventModule {}
