import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Config } from '../common/config/configuration';
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
    private readonly configService: ConfigService<Config>,
  ) {}

  onModuleInit() {
    this.interval = setInterval(() => {
      this.logger.log('Events: ' + this.events);
      this.events = 0;
    }, 1000);
  }

  @OnEvent('event.created')
  handleEventCreated(event: EventCreatedEvent) {
    this.events++;
    this.amqpConnection.publish('bptf-event.created', event.type, event);
  }

  onModuleDestroy() {
    clearInterval(this.interval);
  }
}
