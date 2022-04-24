import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import ReconnectingWebSocket from 'reconnecting-websocket';
import WS from 'ws';

@Injectable()
export class WebsocketService implements BeforeApplicationShutdown {
  private ws: ReconnectingWebSocket;

  constructor() {
    this.ws = new ReconnectingWebSocket('wss://ws.backpack.tf/events', [], {
      WebSocket: WS,
      maxEnqueuedMessages: 0,
      startClosed: false,
    });
  }

  beforeApplicationShutdown(): Promise<void> {
    return new Promise((resolve) => {
      if (this.ws.readyState === ReconnectingWebSocket.CLOSED) {
        resolve();
      } else {
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

  isConnected() {
    return this.ws.readyState === ReconnectingWebSocket.OPEN;
  }
}
