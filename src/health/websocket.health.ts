import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable()
export class WebsocketHealthIndicator extends HealthIndicator {
  constructor(private readonly websocketService: WebsocketService) {
    super();
  }

  isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.websocketService.isConnected()) {
      throw new HealthCheckError(
        'Websocket check failed',
        this.getStatus(key, false, {
          message: 'Not connected to websocket server',
        }),
      );
    } else {
      return Promise.resolve(this.getStatus(key, true));
    }
  }
}
