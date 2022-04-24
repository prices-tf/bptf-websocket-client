import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable()
export class ListingService implements OnModuleDestroy {
  private listener;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly websocketService: WebsocketService,
  ) {
    this.listener = (event) => {
      const data = JSON.parse(event.data);
      this.amqpConnection.publish('bptf-event.created', data.event, data);
    };

    this.websocketService.listen(this.listener);
  }

  onModuleDestroy() {
    this.websocketService.ignore(this.listener);
  }
}
