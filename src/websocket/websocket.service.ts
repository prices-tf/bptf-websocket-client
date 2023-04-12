import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import ReconnectingWebSocket from 'reconnecting-websocket';
import WS from 'ws';
import { Config } from '../common/config/configuration';
import { EventCreatedEvent } from './events/event-created.event';

class CustomWS extends WS {
  constructor(
    url: string,
    protocols?: string | string[],
    options?: WS.ClientOptions,
  ) {
    const newOptions = options ?? {};
    const headers = newOptions.headers || {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    headers['batch-test'] = true;
    headers['User-Agent'] = 'bptf-websocket-client (prices-tf)';

    newOptions.headers = headers;

    super(url, protocols, newOptions);
  }
}

@Injectable()
export class WebsocketService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebsocketService.name);
  private primaryWs: ReconnectingWebSocket;
  private secondaryWs: ReconnectingWebSocket | null = null;
  private reconnectInterval: NodeJS.Timer;

  private listener = (message: MessageEvent<string>) => {
    const data = JSON.parse(message.data);

    if (Array.isArray(data)) {
      data.forEach(this.handleEvent.bind(this));
    } else {
      this.handleEvent(data);
    }
  };

  private handleEvent(data: any) {
    this.eventEmitter.emit(
      'event.created',
      new EventCreatedEvent(data.id, data.event, data.payload),
    );
  }

  constructor(
    private eventEmitter: EventEmitter2,
    private configService: ConfigService<Config>,
  ) {
    this.primaryWs = this.createWebsocket();

    this.reconnectInterval = setInterval(() => {
      this.reconnect();
    }, this.configService.get('reconnectInterval'));
  }

  private createWebsocket(): ReconnectingWebSocket {
    const ws = new ReconnectingWebSocket('wss://ws.backpack.tf/events', [], {
      WebSocket: CustomWS,
      maxEnqueuedMessages: 0,
      startClosed: true,
    });

    ws.addEventListener('message', this.listener);

    ws.addEventListener('open', () => {
      this.logger.log('Connected to websocket');
    });

    ws.addEventListener('close', () => {
      this.logger.warn('Disconnected from websocket');
    });

    return ws;
  }

  private closeWebsocket(ws: ReconnectingWebSocket): Promise<void> {
    return new Promise((resolve) => {
      ws.removeEventListener('message', this.listener);

      if (ws.readyState === ReconnectingWebSocket.CLOSED) {
        resolve();
      } else {
        ws.onclose = () => {
          resolve();
        };
        ws.close();
      }
    });
  }

  private waitForWebsocketOpen(ws: ReconnectingWebSocket): Promise<void> {
    return new Promise((resolve) => {
      if (ws.readyState === ReconnectingWebSocket.OPEN) {
        resolve();
      } else {
        ws.onopen = () => {
          resolve();
          ws.onopen = undefined;
        };
        ws.reconnect();
      }
    });
  }

  onModuleInit(): Promise<void> {
    this.logger.log('Connecting to websocket...');
    return this.waitForWebsocketOpen(this.primaryWs);
  }

  async onModuleDestroy(): Promise<void> {
    clearInterval(this.reconnectInterval);

    const promises = [this.closeWebsocket(this.primaryWs)];
    if (this.secondaryWs) {
      promises.push(this.closeWebsocket(this.secondaryWs));
    }

    await Promise.all(promises);
  }

  async reconnect(): Promise<void> {
    this.logger.log('Starting failover...');

    // Create new websocket client
    this.secondaryWs = this.createWebsocket();

    // Wait for websocket to connect
    await this.waitForWebsocketOpen(this.secondaryWs);

    this.logger.log('New connection open, closing old connection...');

    const temp = this.primaryWs;
    // Set new websocket as primary
    this.primaryWs = this.secondaryWs;
    // Set old websocket as secondary
    this.secondaryWs = temp;

    // Close the old websocket and wait for it to close
    await this.closeWebsocket(this.secondaryWs);
    // Reset the failover flag
    this.secondaryWs = null;

    this.logger.log('Old connection closed, failover complete');
  }

  isConnected() {
    return this.primaryWs.readyState === ReconnectingWebSocket.OPEN;
  }

  isConnecting() {
    return (
      // Primary websocket is connecting
      this.primaryWs.readyState === ReconnectingWebSocket.CONNECTING ||
      // or websocket is closed but retrying to connect
      this.primaryWs.retryCount > 0 ||
      // or a failover is taking place
      this.secondaryWs !== null
    );
  }
}
