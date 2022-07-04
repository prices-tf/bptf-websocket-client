import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EventCreatedEvent } from '../websocket/events/event-created.event';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable()
export class EventService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(EventService.name);
  private events = 0;
  private noEventsCount = 0;
  private interval: NodeJS.Timer;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly websocketService: WebsocketService,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.interval = setInterval(() => {
      this.logger.log('Events: ' + this.events);

      if (this.events === 0) {
        this.noEventsCount++;
      } else {
        this.noEventsCount = 0;
      }

      if (this.noEventsCount >= 5 && !this.websocketService.isConnecting()) {
        this.noEventsCount = 0;
        this.logger.warn('No events received, reconnecting...');
        this.websocketService.reconnect();
      }

      this.events = 0;
    }, 1000);
  }

  @OnEvent('event.created')
  handleEventCreated(event: EventCreatedEvent) {
    this.events++;
    this.amqpConnection.publish(
      'bptf-event.created',
      event.type,
      event.payload,
    );
  }

  onModuleDestroy() {
    clearInterval(this.interval);
  }
}
