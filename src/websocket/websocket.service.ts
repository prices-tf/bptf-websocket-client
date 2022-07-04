import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import ReconnectingWebSocket from 'reconnecting-websocket';
import WS from 'ws';

@Injectable()
export class WebsocketService
  implements OnModuleInit, BeforeApplicationShutdown
{
  private readonly logger = new Logger(WebsocketService.name);
  private ws: ReconnectingWebSocket;

  constructor() {
    this.ws = new ReconnectingWebSocket('wss://ws.backpack.tf/events', [], {
      WebSocket: WS,
      maxEnqueuedMessages: 0,
      startClosed: true,
    });

    this.ws.addEventListener('open', () => {
      this.logger.log('Connected to websocket');
    });

    this.ws.addEventListener('close', () => {
      this.logger.warn('Disconnected from websocket');
    });
  }

  onModuleInit(): Promise<void> {
    this.logger.log('Connecting to websocket...');
    return new Promise((resolve) => {
      this.ws.onopen = () => {
        resolve();
        this.ws.onopen = undefined;
      };
      this.ws.reconnect();
    });
  }

  beforeApplicationShutdown(): Promise<void> {
    return new Promise((resolve) => {
      if (this.ws.readyState === ReconnectingWebSocket.CLOSED) {
        resolve();
      } else {
        this.logger.verbose('Disconnecting from websocket');
        this.ws.onclose = () => {
          resolve();
        };
        this.ws.close();
      }
    });
  }

  listen(callback: (event: MessageEvent<any>) => void) {
    this.ws.addEventListener('message', callback);
  }

  ignore(callback: (event: MessageEvent<any>) => void) {
    this.ws.removeEventListener('message', callback);
  }

  reconnect(): void {
    this.ws.reconnect();
  }

  isConnected() {
    return this.ws.readyState === ReconnectingWebSocket.OPEN;
  }

  isConnecting() {
    return (
      // Websocket is connecting
      this.ws.readyState === ReconnectingWebSocket.CONNECTING ||
      // or websocket is closed but retrying to connect
      this.ws.retryCount > 0
    );
  }
}
