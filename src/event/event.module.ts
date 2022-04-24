import { Module } from '@nestjs/common';
import { RabbitMQWrapperModule } from '../rabbitmq-wrapper/rabbitmq-wrapper.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { EventService } from './event.service';

@Module({
  imports: [RabbitMQWrapperModule, WebsocketModule],
  providers: [EventService],
})
export class EventModule {}
