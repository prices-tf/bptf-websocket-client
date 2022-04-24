import { Module } from '@nestjs/common';
import { RabbitMQWrapperModule } from '../rabbitmq-wrapper/rabbitmq-wrapper.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { ListingService } from './listing.service';

@Module({
  imports: [RabbitMQWrapperModule, WebsocketModule],
  providers: [ListingService],
})
export class ListingModule {}
