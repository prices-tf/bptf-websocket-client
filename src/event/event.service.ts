import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable()
export class EventService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(EventService.name);
  private listener;
  private events = 0;
  private interval: NodeJS.Timer;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly websocketService: WebsocketService,
  ) {
    this.listener = (event) => {
      this.events++;
      const data = JSON.parse(event.data);
      this.amqpConnection.publish('bptf-event.created', data.event, data);
    };

    this.websocketService.listen(this.listener);
  }

  onModuleInit() {
    this.interval = setInterval(() => {
      this.logger.verbose('Events: ' + this.events);
      this.events = 0;
    }, 1000);
  }

  onModuleDestroy() {
    clearInterval(this.interval);
    this.websocketService.ignore(this.listener);
  }
}
